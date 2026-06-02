(() => {
	if (window.__onshapePageBridgeLoaded) return;
	window.__onshapePageBridgeLoaded = true;

	const ENABLE_ANGULAR_EVENT_FORWARDING = true;

	const IGNORED_ANGULAR_EVENTS = new Set([
		"$stateChangeStart",
		"$stateChangeSuccess",
		"$stateChangeError",
		"$viewContentLoaded",
		"RESIZE_ELEMENTS",
		"OS_SPLITTER_CONTAINER_RESIZE",
		"RESIZED_OS_SPLITTER_CONTAINER",
	]);

	function getInjector() {
		return window.angular?.element(document).injector();
	}

	function safeCommand(command, tabType, tabId) {
		return {
			id: `${command.namespace}-${command.command}`,
			tabType,
			tabId,
			showLabel: command.showLabel,
			namespace: command.namespace,
			tooltipKey: command.tooltipKey,
			icon: command.icon,
			command: command.command,
			commandDetails: command.commandDetails,
			expandedTooltipKey: command.expandedTooltipKey,
			useDynamicSnippet: command.useDynamicSnippet,
			name: command.name,
			context: command.context,
			nodeType: command.nodeType,
			ownerType: command.ownerType,
			ownerId: command.ownerId,
			display: command.display,
			disabled: command.disabled,
			isGeneralTool: command.isGeneralTool,
			ignoreNamespace: command.ignoreNamespace,
			isFsVersionCompatible: command.isFsVersionCompatible,
		};
	}

	function getUserShortcutCommands() {
		const injector = getInjector();
		if (!injector) throw new Error("Onshape injector not available");

		const mini = injector.get("MiniToolbarService");

		return (mini.miniToolbarSetting ?? []).map((settingGroup) => {
			const collectionGroup = (mini.miniToolbarCollection ?? []).find(
				(group) => group.tabType === settingGroup.tabType,
			);

			const commands = (settingGroup.commands ?? [])
				.map((setting) => {
					const commandName =
						typeof setting === "string" ? setting : setting.command;

					return collectionGroup?.commands?.find(
						(command) => command.command === commandName,
					);
				})
				.filter(Boolean)
				.map((command) =>
					safeCommand(command, settingGroup.tabType, settingGroup.tabId),
				);

			return {
				tabType: settingGroup.tabType,
				tabId: settingGroup.tabId,
				commands,
			};
		});
	}

	function shouldForwardAngularEvent(name) {
		if (!name || IGNORED_ANGULAR_EVENTS.has(name)) return false;

		return true;
	}

	function startAngularEventForwarding() {
		const injector = getInjector();
		if (!injector || window.__onshapeAngularEventForwardingStarted) return;

		window.__onshapeAngularEventForwardingStarted = true;

		const $rootScope = injector.get("$rootScope");

		const originalBroadcast = $rootScope.$broadcast;
		const originalEmit = $rootScope.$emit;

		function forwardLater(kind, name, args) {
			if (!shouldForwardAngularEvent(name)) return;

			queueMicrotask(() => {
				try {
					window.postMessage(
						{
							type: "OS_ANGULAR_EVENT",
							kind,
							name,
							args: args,
							timestamp: Date.now(),
						},
						window.location.origin,
					);
				} catch (error) {
					console.warn("Failed to forward Onshape Angular event", name, error);
				}
			});
		}

		$rootScope.$broadcast = function patchedBroadcast(name, ...args) {
			const result = originalBroadcast.apply(this, [name, ...args]);

			try {
				forwardLater("broadcast", name, args);
			} catch {
				// Never let forwarding break Onshape.
			}

			return result;
		};

		$rootScope.$emit = function patchedEmit(name, ...args) {
			const result = originalEmit.apply(this, [name, ...args]);

			try {
				forwardLater("emit", name, args);
			} catch {
				// Never let forwarding break Onshape.
			}

			return result;
		};

		console.log("Onshape Angular event forwarding started");
	}

	function executeCommand(data) {
		const injector = getInjector();
		const service = injector?.get("ElementToolbarService");

		if (!service) {
			throw new Error("Onshape ElementToolbarService not available");
		}

		service.executeCommand(data.namespace, data.command, data.commandDetails);
	}

	function executeBroadcastEvent(name, args = []) {
		const injector = getInjector();
		const $rootScope = injector?.get("$rootScope");

		if (!$rootScope) {
			throw new Error("Onshape $rootScope not available");
		}

		$rootScope.$broadcast(name, ...args);
	}

	window.addEventListener("message", (event) => {
		if (event.source !== window) return;

		const data = event.data;
		if (!data) return;

		if (data.type === "OS_GET_USER_SHORTCUT_COMMANDS") {
			try {
				window.postMessage(
					{
						type: "OS_GET_USER_SHORTCUT_COMMANDS_RESULT",
						requestId: data.requestId,
						modes: getUserShortcutCommands(),
					},
					window.location.origin,
				);
			} catch (error) {
				window.postMessage(
					{
						type: "OS_GET_USER_SHORTCUT_COMMANDS_RESULT",
						requestId: data.requestId,
						modes: [],
						error: String(error),
					},
					window.location.origin,
				);
			}

			return;
		}

		if (data.type === "OS_EXECUTE_BROADCAST_EVENT") {
			try {
				executeBroadcastEvent(data.name, data.args);
			} catch (error) {
				console.error("Failed to execute Onshape broadcast event", error);
			}

			return;
		}

		if (data.type === "OS_EXECUTE_COMMAND") {
			try {
				executeCommand(data);
			} catch (error) {
				console.error("Failed to execute Onshape command", error);
			}

			return;
		}
	});

	const interval = window.setInterval(() => {
		if (!getInjector()) return;

		if (ENABLE_ANGULAR_EVENT_FORWARDING) {
			startAngularEventForwarding();
		}

		window.clearInterval(interval);
	}, 250);
})();
