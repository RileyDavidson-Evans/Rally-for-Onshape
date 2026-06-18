import { classifyOnshapeSelection, delay } from "@/core/utils";
import type { OnshapeShortcutCommand, OnshapeToolbarMode } from "@/types";
import type { OnshapeSelectionService } from "@/types/onshape/selection";
import type {
	ElementToolbarService,
	ExecuteCommandMessage,
	MiniToolbarService,
	OnshapeShortcutCommandsResponse,
} from "@/types/onshape-bridge";
import { getInjector } from "./injector";

function safeCommand(
	command: OnshapeShortcutCommand,
	tabType: OnshapeToolbarMode,
	tabId: number,
): OnshapeShortcutCommand {
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

function getCommandName(setting: string | { command: string }): string {
	return typeof setting === "string" ? setting : setting.command;
}

export async function getUserShortcutCommands(): Promise<
	OnshapeShortcutCommandsResponse[]
> {
	document.documentElement.style.setProperty("--mini-toolbar-display", "none");
	const injector = getInjector();
	if (!injector) throw new Error("Onshape injector not available");

	const mini = injector.get<MiniToolbarService>("MiniToolbarService");
	mini.refreshMiniToolbarSettings();

	await delay(1000);

	document.body.dispatchEvent(
		new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
			view: window,
		}),
	);

	document.documentElement.style.setProperty("--mini-toolbar-display", "block");

	return (mini.miniToolbarSetting ?? []).map((settingGroup) => {
		const collectionGroup = (mini.miniToolbarCollection ?? []).find(
			(group) => group.tabType === settingGroup.tabType,
		);

		const commands = (settingGroup.commands ?? [])
			.map((setting) => {
				const commandName = getCommandName(setting);

				return collectionGroup?.commands?.find(
					(command) => command.command === commandName,
				);
			})
			.filter((command): command is OnshapeShortcutCommand => Boolean(command))
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

export function getCurrentSelectionCommands() {
	const injector = getInjector();
	if (!injector) throw new Error("Onshape injector not available");

	const selectionService =
		injector.get<OnshapeSelectionService>("SelectionService");
	const s = selectionService.constructor.getCurrentSelections();

	const annoatetedSelection = s.map((selection) =>
		classifyOnshapeSelection(selection),
	);

	return annoatetedSelection;
}

export async function getAllAvailableCommands(): Promise<
	{ tabType: OnshapeToolbarMode; commands: OnshapeShortcutCommand[] }[]
> {
	document.documentElement.style.setProperty("--mini-toolbar-display", "none");
	const injector = getInjector();
	if (!injector) throw new Error("Onshape injector not available");

	const mini = injector.get<MiniToolbarService>("MiniToolbarService");
	mini.refreshMiniToolbarSettings();

	await delay(1000);

	document.body.dispatchEvent(
		new MouseEvent("mousedown", {
			bubbles: true,
			cancelable: true,
			view: window,
		}),
	);

	document.documentElement.style.setProperty("--mini-toolbar-display", "block");

	return (
		mini?.miniToolbarCollection?.map((c, i) => ({
			...c,
			commands:
				c.commands?.map((command) => safeCommand(command, c.tabType, i)) || [],
		})) || []
	);
}

export function executeCommand(data: ExecuteCommandMessage): void {
	const injector = getInjector();
	const service = injector?.get<ElementToolbarService>("ElementToolbarService");

	if (!service) {
		throw new Error("Onshape ElementToolbarService not available");
	}

	service.executeCommand(data.namespace, data.command, data.commandDetails);
}
