import { useCallback, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { FORWARDED_ONSHAPE_EVENTS } from "@/constants/onshapeEvents";
import { useExtensionSettings } from "@/contexts/ExtensionSettingsContext";
import {
	useOnshapeBridge,
	useOnshapeBridgeSubscription,
} from "@/contexts/OnshapeBridgeContext";
import { useSettingsDialog } from "@/contexts/SettingsDialogContext";
import { getUserShortcutCommands } from "@/core/userShortcuts";
import { watchElementPresence } from "@/core/utils";
import { clampSidebarPosition } from "@/lib/utils";
import { DEFAULT_STORAGE_VALUES } from "@/storage/extensionStorage";
import type { OnshapeShortcutCommandsResponse } from "@/types";
import { PenSidebarMainContent } from "./Content";
import { FixedItems } from "./FixedItems";

export function PenSidebar() {
	const nodeRef = useRef<HTMLDivElement>(null);
	const { openSettings } = useSettingsDialog();

	const { settings, setSetting } = useExtensionSettings();

	const {
		toolbarType,
		currentTool,
		undoEnabled,
		redoEnabled,
		setCurrentTool,
		allAvailableTools,
	} = useOnshapeBridge();

	const [allCommands, setAllCommands] = useState<
		OnshapeShortcutCommandsResponse[]
	>([]);

	const [collapsed, setCollapsed] = useState(false);
	const [featureDialogVisible, setFeatureDialogVisible] = useState(false);
	const [loading, setLoading] = useState(true);

	const init = async () => {
		try {
			document
				.querySelector(".os-mini-toolbar-panel")
				?.classList.add("os-extension-hidden-item");

			const commands = await getUserShortcutCommands();
			document.body.dispatchEvent(
				new MouseEvent("mousedown", {
					bubbles: true,
					cancelable: true,
					view: window,
				}),
			);

			setAllCommands(commands);

			if (!settings.hasSeenWelcomeDialog) {
				setSetting("hasSeenWelcomeDialog", true);

				window.setTimeout(() => {
					openSettings();
				}, 500);
			}

			document
				.querySelector(".os-mini-toolbar-panel")
				?.classList.remove("os-extension-hidden-item");

			const featureDialogParent = document.querySelector("#content-div");

			if (featureDialogParent) {
				watchElementPresence(
					"#feature-dialog",
					(isPresent) => {
						setFeatureDialogVisible(isPresent);
						setCurrentTool(null);
					},
					featureDialogParent,
				);
			}
		} catch (e) {
			console.log("Hello from space ", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		init();
	}, []);

	const setOnshapeSideBarWidth = () => {
		const onshapeSidebarElement = document.querySelector("#left-content-pane");

		document.body.style.setProperty(
			"--os-plus-on-shape-left-content-pane-width",
			`${Math.round(onshapeSidebarElement?.clientWidth || 0)}px`,
		);
	};

	useOnshapeBridgeSubscription(
		useCallback(
			(event) => {
				if (event.name === FORWARDED_ONSHAPE_EVENTS.RESIZE_ELEMENTS) {
					setOnshapeSideBarWidth();
				}
			},
			[setOnshapeSideBarWidth],
		),
	);

	const fixPosition = () => {
		const next = clampSidebarPosition(
			settings.toolbarPosition,
			DEFAULT_STORAGE_VALUES.toolbarPosition,
		);
		setSetting("toolbarPosition", next);
	};

	useEffect(() => {
		fixPosition();
		window.addEventListener("resize", fixPosition);
		window.addEventListener("orientationchange", fixPosition);
		window.visualViewport?.addEventListener("resize", fixPosition);
		window.visualViewport?.addEventListener("scroll", fixPosition);

		return () => {
			window.removeEventListener("resize", fixPosition);
			window.removeEventListener("orientationchange", fixPosition);
			window.visualViewport?.removeEventListener("resize", fixPosition);
			window.visualViewport?.removeEventListener("scroll", fixPosition);
		};
	}, []);

	const flatAllTools = allAvailableTools.flatMap((t) => t.commands);

	const modeTools = settings.toolbarQuickActions[toolbarType]
		.map((c) => flatAllTools.find((fa) => fa.command === c))
		.filter((v) => !!v);

	if (loading) return null;
	return (
		<Draggable
			nodeRef={nodeRef}
			handle=".os-pen-drag-handle"
			position={settings.toolbarPosition}
			onDrag={(_, data) => {
				setSetting("toolbarPosition", {
					x: data.x,
					y: data.y,
				});
			}}
			onStop={(_, data) => {
				const next = clampSidebarPosition(
					{ x: data.x, y: data.y },
					DEFAULT_STORAGE_VALUES.toolbarPosition,
				);
				setSetting("toolbarPosition", next);
			}}
		>
			<div
				ref={nodeRef}
				id="os-pen-shortcut-sidebar"
				className="
					os-plus-glass
					rounded-lg
					fixed left-0 top-0 z-[9999]
					flex max-h-[70vh] flex-col
					overflow-hidden
					w-max
					pt-2
					os-animate-in
				"
			>
				<FixedItems
					collapsed={collapsed}
					setCollapsed={setCollapsed}
					setOnshapeSideBarWidth={setOnshapeSideBarWidth}
				/>

				{!collapsed && (
					<PenSidebarMainContent
						modeTools={modeTools}
						toolbarType={toolbarType}
						currentTool={currentTool}
						redoEnabled={redoEnabled}
						undoEnabled={undoEnabled}
						featureDialogVisible={featureDialogVisible}
					/>
				)}
			</div>
		</Draggable>
	);
}
