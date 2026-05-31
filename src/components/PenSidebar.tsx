import { IconGripHorizontal } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getUserShortcutCommands } from "@/core/userShortcuts";
import type { ToolDefinition } from "@/features/types";
import type {
	OnshapeShortcutCommandsResponse,
	OnshapeToolbarMode,
} from "@/types";
import { getToolIcon } from "../core/iconMapping";
import { executeOnshapeShortcutCommand, pressKey } from "../core/utils";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";

const STORAGE_KEY = "onshapePenSidebarPosition";
const LABEL_MODE_KEY = "onshapePenSidebarLabelsAlwaysVisible";

type ToolItem = {
	type: "button";
	id: string;
	icon: ToolDefinition["icon"];
	title: string;
	onClick: () => void;
	tone?: "default" | "primary" | "danger" | "success";
};

type SpacerItem = {
	type: "spacer";
	id: string;
};

type SectionLabelItem = {
	type: "label";
	id: string;
	title: string;
};

type MenuItem = ToolItem | SpacerItem | SectionLabelItem;

const MotionButton = motion.create(Button);

function showKeyboard() {
	try {
		const nav = navigator as Navigator & {
			virtualKeyboard?: { show?: () => void };
		};

		nav.virtualKeyboard?.show?.();
	} catch {}

	try {
		window.location.href = "ms-inputapp://";
	} catch {}
}

function toggleFullscreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen?.();
	} else {
		document.exitFullscreen?.();
	}
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export function PenSidebar() {
	const nodeRef = useRef<HTMLDivElement>(null);
	const [allCommands, setAllCommands] = useState<
		OnshapeShortcutCommandsResponse[]
	>([]);

	const [visible, setVisible] = useState(false);

	const [position, setPosition] = useState(() => {
		try {
			return JSON.parse(
				localStorage.getItem(STORAGE_KEY) ?? JSON.stringify({ x: 12, y: 200 }),
			);
		} catch {
			return { x: 12, y: 200 };
		}
	});

	const [toolbarType, setToolbarType] =
		useState<OnshapeToolbarMode>("Part Studio");

	const [labelsVisible, setLabelsVisible] = useState(
		() => localStorage.getItem(LABEL_MODE_KEY) === "true",
	);
	useEffect(() => {
		async function onMessage(event: MessageEvent) {
			if (event.source !== window) return;

			const data = event.data;
			if (!data || data.type !== "OS_ANGULAR_EVENT") return;

			if (data.name === "ELEMENT_LOAD_DONE") {
				setVisible(true);
				pressKey("s");

				await delay(250);

				document.body.dispatchEvent(
					new MouseEvent("mousedown", {
						bubbles: true,
						cancelable: true,
						view: window,
					}),
				);
				await delay(1000);
				getUserShortcutCommands().then((commands) => {
					setAllCommands(commands);
				});
			}

			if (data.name === "CHANGE_ELEMENT_TOOLBAR") {
				const newToolbarType = data.args?.[0]?.toolbarName || null;
				setToolbarType(newToolbarType);
			}
		}

		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);

	useEffect(() => {
		localStorage.setItem(LABEL_MODE_KEY, String(labelsVisible));
	}, [labelsVisible]);

	if (!visible) return null;

	const modeTools =
		allCommands.find((c) => c.tabType === toolbarType)?.commands ?? [];

	console.log(modeTools);

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
				className={[
					"fixed left-0 top-0 z-[999999]",
					"flex flex-col items-center gap-1",
					"rounded border border-white/10 bg-zinc-950/72 p-1.5 text-zinc-50 shadow-2xl shadow-black/40 backdrop-blur-2xl",
					"ring-1 ring-white/10",
				].join(" ")}
			>
				<div className="os-pen-drag-handle flex h-5 w-11 cursor-grab touch-none items-center justify-center rounded-xl">
					<IconGripHorizontal className="h-3.5 w-3.5" />
				</div>

				<motion.div
					layout
					className="os-pen-buttons flex flex-col items-center gap-1"
				>
					<AnimatePresence mode="popLayout" initial={false}>
						{modeTools.map((tool) => {
							const Icon = getToolIcon(tool.command);

							return (
								<Tooltip key={tool.id}>
									<TooltipTrigger asChild>
										<MotionButton
											layout
											type="button"
											variant={"secondary"}
											disabled={tool.disabled}
											className={[].join(" ")}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();

												executeOnshapeShortcutCommand(tool);
											}}
										>
											<Icon className="h-5 w-5" strokeWidth={2.2} />
										</MotionButton>
									</TooltipTrigger>

									<TooltipContent side="right">
										<Card>
											<CardContent>
												<CardTitle>{tool.command}</CardTitle>
												<CardDescription>
													{tool.expandedTooltipKey?.replace("tooltips:::", "")}
												</CardDescription>
											</CardContent>
										</Card>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</AnimatePresence>
				</motion.div>
			</div>
		</Draggable>
	);
}
