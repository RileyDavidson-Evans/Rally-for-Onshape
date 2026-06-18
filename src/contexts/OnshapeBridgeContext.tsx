import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	ACCEPTED_ONSHAPE_TO_EXTENSION_EVENT_TYPE,
	FORWARDED_ONSHAPE_EVENTS,
} from "@/constants/onshapeEvents";
import type { OnshapeShortcutCommand, OnshapeToolbarMode } from "@/types";

type OnshapeBridgeEvent = {
	type: typeof ACCEPTED_ONSHAPE_TO_EXTENSION_EVENT_TYPE;
	name: string;
	args?: any[];
	data?: Record<string, any>;
};

type OnshapeBridgeHandler = (event: OnshapeBridgeEvent) => void;

type AllTools = {
	tabType: OnshapeToolbarMode;
	commands: OnshapeShortcutCommand[];
}[];

type OnshapeBridgeContextValue = {
	isDocumentLoaded: boolean;
	toolbarType: OnshapeToolbarMode;
	allAvailableTools: AllTools;
	currentTool: string | null;
	setCurrentTool: (v: string | null) => void;
	undoEnabled: boolean;
	redoEnabled: boolean;
	subscribe: (handler: OnshapeBridgeHandler) => () => void;
};

const OnshapeBridgeContext = createContext<OnshapeBridgeContextValue | null>(
	null,
);

function isOnshapeBridgeEvent(data: unknown): data is OnshapeBridgeEvent {
	return (
		typeof data === "object" &&
		data !== null &&
		(data as any).type === ACCEPTED_ONSHAPE_TO_EXTENSION_EVENT_TYPE &&
		typeof (data as any).name === "string"
	);
}

export function OnshapeBridgeProvider({ children }: { children: ReactNode }) {
	const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
	const [toolbarType, setToolbarType] =
		useState<OnshapeToolbarMode>("Part Studio");
	const [currentTool, setCurrentTool] = useState<string | null>(null);
	const [undoEnabled, setUndoEnabled] = useState(false);
	const [allAvailableTools, setAllAvailableTools] = useState<AllTools>([]);
	const [redoEnabled, setRedoEnabled] = useState(false);
	const [subscribers] = useState(() => new Set<OnshapeBridgeHandler>());

	const subscribe = useCallback(
		(handler: OnshapeBridgeHandler) => {
			subscribers.add(handler);

			return () => {
				subscribers.delete(handler);
			};
		},
		[subscribers],
	);

	const requestAllCommands = () => {
		window.postMessage(
			{
				type: "OS_GET_ALL_AVAILABLE_COMMANDS",
			},
			window.location.origin,
		);
	};

	useEffect(() => {
		function onMessage(messageEvent: MessageEvent) {
			if (messageEvent.source !== window) return;
			if (!isOnshapeBridgeEvent(messageEvent.data)) return;
			const event = messageEvent.data;

			if (event.name === FORWARDED_ONSHAPE_EVENTS.ELEMENT_LOAD_DONE) {
				setIsDocumentLoaded(true);
				requestAllCommands();
			}

			if (event.name === FORWARDED_ONSHAPE_EVENTS.DOCUMENT_UNLOADED) {
				setIsDocumentLoaded(false);
				setCurrentTool(null);
				setUndoEnabled(false);
				setRedoEnabled(false);
			}

			if (
				event.name ===
				FORWARDED_ONSHAPE_EVENTS.OS_GET_ALL_AVAILABLE_COMMANDS_RESULT
			) {
				setAllAvailableTools(event.data as AllTools);
			}

			if (event.name === FORWARDED_ONSHAPE_EVENTS.CHANGE_ELEMENT_TOOLBAR) {
				const nextToolbarType = event.args?.[0]?.toolbarName;

				if (nextToolbarType) {
					setToolbarType(nextToolbarType);
				}
			}

			if (event.name === FORWARDED_ONSHAPE_EVENTS.ENABLE_TOOLBAR_COMMAND) {
				if (event.args?.includes("UNDO_A_CHANGE")) setUndoEnabled(true);
				if (event.args?.includes("REDO_A_CHANGE")) setRedoEnabled(true);
			}

			if (event.name === FORWARDED_ONSHAPE_EVENTS.DISABLE_TOOLBAR_COMMAND) {
				if (event.args?.includes("UNDO_A_CHANGE")) setUndoEnabled(false);
				if (event.args?.includes("REDO_A_CHANGE")) setRedoEnabled(false);
			}

			if (
				event.name === FORWARDED_ONSHAPE_EVENTS.ELEMENT_TOOLBAR_SET_CURRENT_TOOL
			) {
				setCurrentTool(event.args?.[0] ?? null);
			}

			if (
				event.name ===
				FORWARDED_ONSHAPE_EVENTS.ELEMENT_TOOLBAR_EXIT_CURRENT_TOOL
			) {
				setCurrentTool(null);
			}

			if (event.name === FORWARDED_ONSHAPE_EVENTS.ADD_NEW_FEATURE) {
				setCurrentTool(event.args?.[0]?.command ?? null);
			}

			for (const subscriber of subscribers) {
				subscriber(event);
			}
		}

		window.addEventListener("message", onMessage);

		return () => {
			window.removeEventListener("message", onMessage);
			subscribers.clear();
		};
	}, [subscribers]);

	const value = useMemo(
		() => ({
			isDocumentLoaded,
			allAvailableTools,
			toolbarType,
			currentTool,
			undoEnabled,
			redoEnabled,
			subscribe,
			setCurrentTool,
		}),
		[
			isDocumentLoaded,
			allAvailableTools,
			toolbarType,
			currentTool,
			undoEnabled,
			redoEnabled,
			subscribe,
			setCurrentTool,
		],
	);

	if (!isDocumentLoaded || !allAvailableTools.length) return null;

	return (
		<OnshapeBridgeContext.Provider value={value}>
			{children}
		</OnshapeBridgeContext.Provider>
	);
}

export function useOnshapeBridge() {
	const context = useContext(OnshapeBridgeContext);

	if (!context) {
		throw new Error(
			"useOnshapeBridge must be used inside an OnshapeBridgeProvider",
		);
	}

	return context;
}

export function useOnshapeBridgeSubscription(handler: OnshapeBridgeHandler) {
	const { subscribe } = useOnshapeBridge();

	useEffect(() => {
		return subscribe(handler);
	}, [handler, subscribe]);
}
