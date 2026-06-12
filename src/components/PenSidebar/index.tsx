import { useCallback, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { FORWARDED_ONSHAPE_EVENTS } from "@/constants/onshapeEvents";
import { HAS_SEEN_SETTINGS_ONBOARDING_KEY } from "@/constants/storage";
import {
	useOnshapeBridge,
	useOnshapeBridgeSubscription,
} from "@/contexts/OnshapeBridgeContext";
import { useSettingsDialog } from "@/contexts/SettingsDialogContext";
import { getUserShortcutCommands } from "@/core/userShortcuts";
import { watchElementPresence } from "@/core/utils";
import {
	clampSidebarPosition,
	getInitialPosition,
	STORAGE_KEY,
} from "@/lib/utils";
import type { OnshapeShortcutCommandsResponse } from "@/types";
import { PenSidebarMainContent } from "./Content";
import { FixedItems } from "./FixedItems";

export function PenSidebar() {
	const nodeRef = useRef<HTMLDivElement>(null);
	const { openSettings } = useSettingsDialog();

	const { toolbarType, currentTool, undoEnabled, redoEnabled, setCurrentTool } =
		useOnshapeBridge();

	const [allCommands, setAllCommands] = useState<
		OnshapeShortcutCommandsResponse[]
	>([]);

	const [collapsed, setCollapsed] = useState(false);
	const [featureDialogVisible, setFeatureDialogVisible] = useState(false);
	const [position, setPosition] = useState(getInitialPosition);
	const fixPositionRef = useRef<number | undefined>(undefined);
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

			const hasSeenSettingsOnboarding = localStorage.getItem(
				HAS_SEEN_SETTINGS_ONBOARDING_KEY,
			);

			if (!hasSeenSettingsOnboarding) {
				localStorage.setItem(HAS_SEEN_SETTINGS_ONBOARDING_KEY, "true");

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
		window.clearTimeout(fixPositionRef.current);

		fixPositionRef.current = window.setTimeout(() => {
			setPosition((current) => {
				const next = clampSidebarPosition(current);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				return next;
			});
		}, 250);
	};

	useEffect(() => {
		fixPosition();
		window.addEventListener("resize", fixPosition);
		window.addEventListener("orientationchange", fixPosition);
		window.visualViewport?.addEventListener("resize", fixPosition);
		window.visualViewport?.addEventListener("scroll", fixPosition);

		return () => {
			window.clearTimeout(fixPositionRef.current);
			window.removeEventListener("resize", fixPosition);
			window.removeEventListener("orientationchange", fixPosition);
			window.visualViewport?.removeEventListener("resize", fixPosition);
			window.visualViewport?.removeEventListener("scroll", fixPosition);
		};
	}, []);

	const modeTools =
		allCommands.find((c) => c.tabType === toolbarType)?.commands ?? [];

	if (loading) return null;
	return (
		<Draggable
			nodeRef={nodeRef}
			handle=".os-pen-drag-handle"
			position={position}
			onDrag={(_, data) => {
				setPosition({ x: data.x, y: data.y });
			}}
			onStop={(_, data) => {
				const next = clampSidebarPosition({ x: data.x, y: data.y });
				setPosition(next);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
