import type { OnshapeShortcutCommand, OnshapeToolbarMode } from ".";

export type AngularEventKind = "broadcast" | "emit";

export type UnknownRecord = Record<string, unknown>;

export interface OnshapeAngularRootScope {
	$broadcast: (name: string, ...args: unknown[]) => unknown;
	$emit: (name: string, ...args: unknown[]) => unknown;
}

export interface OnshapeAngularInjector {
	get: <T = unknown>(name: string) => T;
}

export interface OnshapeAngular {
	element: (element: Document | Element) => {
		injector: () => OnshapeAngularInjector | undefined;
	};
}

export interface OnshapeMiniToolbarSettingGroup {
	tabType: OnshapeToolbarMode;
	tabId: number;
	commands?: Array<string | { command: string }>;
}

export interface OnshapeMiniToolbarCollectionGroup {
	tabType: OnshapeToolbarMode;
	commands: OnshapeShortcutCommand[];
}

export interface MiniToolbarService {
	miniToolbarSetting?: OnshapeMiniToolbarSettingGroup[];
	miniToolbarCollection?: OnshapeMiniToolbarCollectionGroup[];
	refreshMiniToolbarSettings: () => void;
}

export interface ElementToolbarService {
	executeCommand: (
		namespace: string,
		command: string,
		commandDetails?: unknown,
	) => unknown;
}

export interface OnshapeShortcutCommandsResponse {
	tabType: string;
	tabId: number;
	commands: OnshapeShortcutCommand[];
}

export interface BaseInboundMessage {
	type: string;
	requestId?: string;
}

export interface GetUserShortcutCommandsMessage extends BaseInboundMessage {
	type: "OS_GET_USER_SHORTCUT_COMMANDS";
	requestId: string;
}

export interface GetCurrentUserSelectionCommandMessage
	extends BaseInboundMessage {
	type: "GET_CURRENT_USER_SELECTIONS";
}

export interface GetAllAvailableCommandsCommandMessage
	extends BaseInboundMessage {
	type: "OS_GET_ALL_AVAILABLE_COMMANDS";
}

export interface ExecuteBroadcastEventMessage extends BaseInboundMessage {
	type: "OS_EXECUTE_BROADCAST_EVENT";
	name: string;
	args?: unknown[];
}

export interface ExecuteCommandMessage extends BaseInboundMessage {
	type: "OS_EXECUTE_COMMAND";
	namespace: string;
	command: string;
	commandDetails?: unknown;
}

export type InboundBridgeMessage =
	| GetUserShortcutCommandsMessage
	| ExecuteBroadcastEventMessage
	| ExecuteCommandMessage
	| GetCurrentUserSelectionCommandMessage
	| GetAllAvailableCommandsCommandMessage;
