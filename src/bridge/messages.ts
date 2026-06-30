import {
	ACCEPTED_ONSHAPE_TO_EXTENSION_EVENT_TYPE,
	FORWARDED_ONSHAPE_EVENTS,
} from "@/constants/onshapeEvents";
import type { GetUserShortcutCommandsMessage } from "@/types/onshape-bridge";
import { executeBroadcastEvent, postToPage } from "./angular-events";
import {
	executeCommand,
	getAllAvailableCommands,
	getCurrentSelectionCommands,
	getUserShortcutCommands,
} from "./commands";
import { isInboundBridgeMessage } from "./guards";

async function handleGetUserShortcutCommands(
	data: GetUserShortcutCommandsMessage,
): Promise<void> {
	try {
		const result = await getUserShortcutCommands();
		postToPage({
			type: "OS_GET_USER_SHORTCUT_COMMANDS_RESULT",
			requestId: data.requestId,
			modes: result,
		});
	} catch (error) {
		postToPage({
			type: "OS_GET_USER_SHORTCUT_COMMANDS_RESULT",
			requestId: data.requestId,
			modes: [],
			error: String(error),
		});
	}
}

async function handleGetAllCommandsCommands(): Promise<void> {
	try {
		const result = await getAllAvailableCommands();
		postToPage({
			name: "OS_GET_ALL_AVAILABLE_COMMANDS_RESULT",
			type: ACCEPTED_ONSHAPE_TO_EXTENSION_EVENT_TYPE,
			data: result,
		});
	} catch (error) {
		postToPage({
			name: "OS_GET_ALL_AVAILABLE_COMMANDS_RESULT",
			type: ACCEPTED_ONSHAPE_TO_EXTENSION_EVENT_TYPE,
			data: [],
			error: String(error),
		});
	}
}

function handleCurrentUserSelectionsCommands() {
	try {
		const result = getCurrentSelectionCommands();
		window.postMessage(
			{
				name: FORWARDED_ONSHAPE_EVENTS.SELECTION_UPDATED,
				data: result,
				type: ACCEPTED_ONSHAPE_TO_EXTENSION_EVENT_TYPE,
			},
			window.location.origin,
		);
	} catch (e) {
		window.postMessage(
			{
				name: FORWARDED_ONSHAPE_EVENTS.SELECTION_UPDATED,
				data: [],
				type: ACCEPTED_ONSHAPE_TO_EXTENSION_EVENT_TYPE,
			},
			window.location.origin,
		);
	}
}

export function handleMessage(event: MessageEvent<unknown>): void {
	if (event.source !== window) return;
	if (!isInboundBridgeMessage(event.data)) return;

	const data = event.data;

	switch (data.type) {
		// case "OS_GET_USER_SHORTCUT_COMMANDS": {
		// 	if (typeof data.requestId !== "string") return;
		// 	handleGetUserShortcutCommands(data);
		// 	return;
		// }

		case "GET_CURRENT_USER_SELECTIONS": {
			handleCurrentUserSelectionsCommands();
			return;
		}

		// case "OS_GET_ALL_AVAILABLE_COMMANDS": {
		// 	handleGetAllCommandsCommands();
		// 	return;
		// }

		case "OS_EXECUTE_BROADCAST_EVENT": {
			if (typeof data.name !== "string") return;

			try {
				executeBroadcastEvent(
					data.name,
					Array.isArray(data.args) ? data.args : [],
				);
			} catch (error) {
				console.error("Failed to execute Onshape broadcast event", error);
			}

			return;
		}

		case "OS_EXECUTE_COMMAND": {
			if (
				typeof data.namespace !== "string" ||
				typeof data.command !== "string"
			) {
				return;
			}

			try {
				executeCommand(data);
			} catch (error) {
				console.error("Failed to execute Onshape command", error);
			}

			return;
		}
	}
}
