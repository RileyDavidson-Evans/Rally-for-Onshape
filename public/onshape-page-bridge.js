(() => {
	if (window.__onshapePageBridgeLoaded) return;
	window.__onshapePageBridgeLoaded = true;

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

	function startAngularEventForwarding() {
		const injector = getInjector();
		if (!injector || window.__onshapeAngularEventForwardingStarted) return;

		window.__onshapeAngularEventForwardingStarted = true;

		const $rootScope = injector.get("$rootScope");

		const originalBroadcast = $rootScope.$broadcast;
		const originalEmit = $rootScope.$emit;

		function forward(kind, name, args) {
			window.postMessage(
				{
					type: "OS_ANGULAR_EVENT",
					kind,
					name,
					args,
					timestamp: Date.now(),
				},
				window.location.origin,
			);
		}

		$rootScope.$broadcast = function patchedBroadcast(name, ...args) {
			if (name !== "$stateChangeStart") {
				forward("broadcast", name, args);
			}
			return originalBroadcast.apply(this, [name, ...args]);
		};

		$rootScope.$emit = function patchedEmit(name, ...args) {
			forward("emit", name, args);
			return originalEmit.apply(this, [name, ...args]);
		};

		console.log("Onshape Angular event forwarding started");
	}

	function executeCommand(data) {
		const injector = getInjector();
		const service = injector?.get("ElementToolbarService");

		service?.executeCommand(data.namespace, data.command, data.commandDetails);
	}

	function executeBroadcastEvent(name, args = []) {
		const injector = getInjector();
		const $rootScope = injector?.get("$rootScope");

		if (!$rootScope) throw new Error("Onshape $rootScope not available");

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
		if (getInjector()) {
			startAngularEventForwarding();
			window.clearInterval(interval);
		}
	}, 250);
})();
