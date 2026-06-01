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
import type {
	OnshapeShortcutCommandsResponse,
	OnshapeToolbarMode,
} from "@/types";
import { getToolIcon } from "../core/iconMapping";
import { executeOnshapeShortcutCommand, pressKey } from "../core/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

const STORAGE_KEY = "onshapePenSidebarPosition";
const LABEL_MODE_KEY = "onshapePenSidebarLabelsAlwaysVisible";

const MotionButton = motion.create(Button);

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
				className="fixed left-0 top-0 z-[999999] bg-background p-3 shadow rounded-md"
			>
				<Button
					variant="outline"
					className="os-pen-drag-handle h-10 w-10 cursor-pointer mb-1"
				>
					<IconGripHorizontal />
				</Button>

				<div className="flex flex-col items-center gap-1">
					{modeTools.map((tool) => {
						const Icon = getToolIcon(tool.command);

						return (
							<Tooltip key={tool.id}>
								<TooltipTrigger asChild>
									<Button
										className="h-10 w-10 cursor-pointer"
										variant="outline"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();

											executeOnshapeShortcutCommand(tool);
										}}
									>
										<Icon />
									</Button>
								</TooltipTrigger>

								<TooltipContent side="right" className="bg-transparent">
									<Card className="w-[350px]">
										<CardHeader>
											<CardTitle>{tool.command}</CardTitle>
											<CardDescription>
												{tool.expandedTooltipKey?.replace("tooltips:::", "")}
											</CardDescription>
										</CardHeader>
									</Card>
								</TooltipContent>
							</Tooltip>
						);
					})}
				</div>
			</div>
		</Draggable>
	);
}
