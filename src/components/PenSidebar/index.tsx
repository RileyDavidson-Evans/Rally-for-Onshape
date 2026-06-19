import { useCallback, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { FORWARDED_ONSHAPE_EVENTS } from "@/constants/onshapeEvents";
import { useExtensionSettings } from "@/contexts/ExtensionSettingsContext";
import {
	useOnshapeBridge,
	useOnshapeBridgeSubscription,
} from "@/contexts/OnshapeBridgeContext";
import { watchElementPresence } from "@/core/utils";
import { clampSidebarPosition } from "@/lib/utils";
import { DEFAULT_STORAGE_VALUES } from "@/storage/extensionStorage";
import { PenSidebarMainContent } from "./Content";
import { FixedItems } from "./FixedItems";

export function PenSidebar() {
	const nodeRef = useRef<HTMLDivElement>(null);

	const { settings, setSetting } = useExtensionSettings();

	const {
		toolbarType,
		currentTool,
		undoEnabled,
		redoEnabled,
		setCurrentTool,
		allAvailableTools,
	} = useOnshapeBridge();

	const [collapsed, setCollapsed] = useState(false);
	const [featureDialogVisible, setFeatureDialogVisible] = useState(false);

	useEffect(() => {
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

	const modeTools =
		allAvailableTools
			.find((t) => t.tabType === toolbarType)
			?.commands.filter((c) =>
				settings.toolbarQuickActions[toolbarType].includes(c.command),
			) || [];

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
					fixed left-0 top-0 z-30
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
