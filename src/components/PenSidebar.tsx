import {
	ChevronDown,
	ChevronUp,
	Fullscreen,
	GripHorizontal,
	Pencil,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	ACCEPTED_ONSHAPE_TO_EXTENSION_EVENT_TYPE,
	FORWARDED_ONSHAPE_EVENTS,
} from "@/constants/onshapeEvents";
import { getUserShortcutCommands } from "@/core/userShortcuts";
import { toggleFullscreen } from "@/core/utils";
import type {
	OnshapeShortcutCommandsResponse,
	OnshapeToolbarMode,
} from "@/types";
import { pressKey } from "../core/utils";
import { PenSidebarMainContent } from "./PenSidebarMainContent";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

const STORAGE_KEY = "onshapePenSidebarScreenPosition";

const DEFAULT_POSITION = {
	x: 290,
	y: 100,
};

export function PenSidebar() {
	const nodeRef = useRef<HTMLDivElement>(null);
	const [allCommands, setAllCommands] = useState<
		OnshapeShortcutCommandsResponse[]
	>([]);

	const [currentTool, setCurrentTool] = useState<string | null>(null);

	const [collapsed, setCollapsed] = useState(false);

	const [visible, setVisible] = useState(false);

	const initialLoadDoneRef = useRef(false);

	const [position, setPosition] = useState(() => {
		try {
			return JSON.parse(
				localStorage.getItem(STORAGE_KEY) ??
					JSON.stringify({ x: DEFAULT_POSITION.x, y: DEFAULT_POSITION.y }),
			);
		} catch {
			return { x: DEFAULT_POSITION.x, y: DEFAULT_POSITION.y };
		}
	});

	const [toolbarType, setToolbarType] =
		useState<OnshapeToolbarMode>("Part Studio");

	const onLeaveDocumentHandler = () => {
		setVisible(false);
		initialLoadDoneRef.current = false;
		setAllCommands([]);
		setCurrentTool(null);
	};

	useEffect(() => {
		async function onMessage(event: MessageEvent) {
			if (event.source !== window) return;

			const data = event.data;
			if (!data || data.type !== ACCEPTED_ONSHAPE_TO_EXTENSION_EVENT_TYPE)
				return;

			if (data.name === FORWARDED_ONSHAPE_EVENTS.ELEMENT_LOAD_DONE) {
				document
					.querySelector(".os-mini-toolbar-panel")
					?.classList.add("os-extension-hidden-item");
				pressKey("s");
			}

			if (data.name === FORWARDED_ONSHAPE_EVENTS.OPEN_MINI_TOOLBAR) {
				if (initialLoadDoneRef.current) return;
				initialLoadDoneRef.current = true;
				document.body.dispatchEvent(
					new MouseEvent("mousedown", {
						bubbles: true,
						cancelable: true,
						view: window,
					}),
				);
				getUserShortcutCommands().then((commands) => {
					setVisible(true);
					setAllCommands(commands);
					document
						.querySelector(".os-mini-toolbar-panel")
						?.classList.remove("os-extension-hidden-item");
				});
			}

			if (data.name === FORWARDED_ONSHAPE_EVENTS.CHANGE_ELEMENT_TOOLBAR) {
				const newToolbarType = data.args?.[0]?.toolbarName || null;
				setToolbarType(newToolbarType);
			}

			if (
				data.name === FORWARDED_ONSHAPE_EVENTS.ELEMENT_TOOLBAR_SET_CURRENT_TOOL
			) {
				const currentTool = data.args?.[0];
				setCurrentTool(currentTool);
			}

			if (
				data.name === FORWARDED_ONSHAPE_EVENTS.ELEMENT_TOOLBAR_EXIT_CURRENT_TOOL
			) {
				setCurrentTool(null);
			}

			if (data.name === FORWARDED_ONSHAPE_EVENTS.DOCUMENT_UNLOADED) {
				onLeaveDocumentHandler();
			}
		}

		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);

	if (!visible) return null;

	const modeTools =
		allCommands.find((c) => c.tabType === toolbarType)?.commands ?? [];

	return (
		<Draggable
			nodeRef={nodeRef}
			handle=".os-pen-drag-handle"
			position={position}
			onDrag={(_, data) => {
				setPosition({ x: data.x, y: data.y });
			}}
			onStop={(_, data) => {
				const next = { x: data.x, y: data.y };
				setPosition(next);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			}}
		>
			<div
				ref={nodeRef}
				id="os-pen-shortcut-sidebar"
				className="fixed left-0 top-0 z-[999999] flex max-h-[80vh] flex-col rounded-md border bg-background/95 py-2 shadow-2xl backdrop-blur os-animate-in overflow-hidden"
			>
				<div className="flex flex-col items-center gap-1 px-2">
					<Button
						variant="outline"
						size="icon"
						className="os-pen-drag-handle h-10 w-10 shrink-0 cursor-pointer active:cursor-grabbing"
					>
						<GripHorizontal />
					</Button>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="h-10 w-10 shrink-0 cursor-pointer"
								onClick={toggleFullscreen}
							>
								<Fullscreen />
							</Button>
						</TooltipTrigger>

						<TooltipContent side="right">
							<Card className="w-[350px]">
								<CardHeader>
									<CardTitle>Toggle Fullscreen</CardTitle>
									<CardDescription>
										Toggles the fullscreen onshape experience, give it a try to
										experience onshape like a native app!
									</CardDescription>
								</CardHeader>
							</Card>
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="h-10 w-10 shrink-0 cursor-pointer"
								onClick={() =>
									window.open(
										"https://cad.onshape.com/user/settings?minicontext=0",
										"_blank",
									)
								}
							>
								<Pencil />
							</Button>
						</TooltipTrigger>

						<TooltipContent side="right">
							<Card className="w-[350px]">
								<CardHeader>
									<CardTitle>Edit Shortcuts</CardTitle>
									<CardDescription>
										The dynamic items are based on your onshape mini toolbar
										items. Click the button to edit and then refresh the page to
										see the changes.
									</CardDescription>
								</CardHeader>
							</Card>
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="h-10 w-10 shrink-0 cursor-pointer"
								onClick={() => setCollapsed((c) => !c)}
							>
								{collapsed ? <ChevronDown /> : <ChevronUp />}
							</Button>
						</TooltipTrigger>

						<TooltipContent side="right">
							<Card className="w-[350px]">
								<CardHeader>
									<CardTitle>Collapse</CardTitle>
									<CardDescription>
										Hide / Show the sidebar content.
									</CardDescription>
								</CardHeader>
							</Card>
						</TooltipContent>
					</Tooltip>
				</div>
				{!collapsed && (
					<PenSidebarMainContent
						modeTools={modeTools}
						toolbarType={toolbarType}
						currentTool={currentTool}
					/>
				)}
			</div>
		</Draggable>
	);
}
