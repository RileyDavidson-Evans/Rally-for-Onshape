import {
	IconCheck,
	IconGripHorizontal,
	IconKeyboard,
	IconLoader2,
	IconRotateClockwise,
	IconSearch,
	IconTrash,
	IconX,
} from "@tabler/icons-react";
import { motion } from "motion/react";
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
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

const STORAGE_KEY = "onshapePenSidebarPosition";
const LABEL_MODE_KEY = "onshapePenSidebarLabelsAlwaysVisible";

const MotionButton = motion.create(Button);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type UtilityAction = {
	id: string;
	label: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	onClick: () => void;
};

function SidebarDivider() {
	return <div className="my-3 h-px w-full bg-border" />;
}

function UtilityButton({ action }: { action: UtilityAction }) {
	const Icon = action.icon;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					className="h-10 w-10 cursor-pointer"
					variant="outline"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						action.onClick();
					}}
				>
					<Icon className="h-5 w-5" />
				</Button>
			</TooltipTrigger>

			<TooltipContent side="right">
				<Card className="w-[260px]">
					<CardHeader>
						<CardTitle>{action.label}</CardTitle>
						<CardDescription>{action.description}</CardDescription>
					</CardHeader>
				</Card>
			</TooltipContent>
		</Tooltip>
	);
}

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

	const utilityActions: UtilityAction[] = [
		{
			id: "undo",
			label: "Undo",
			description: "Undo the last action.",
			icon: () => <IconRotateClockwise className="transform rotate-180" />,
			onClick: () => pressKey("z", { ctrlKey: true }),
		},
		{
			id: "redo",
			label: "Redo",
			description: "Redo the last undone action.",
			icon: IconRotateClockwise,
			onClick: () => pressKey("y", { ctrlKey: true }),
		},
		{
			id: "delete",
			label: "Delete",
			description: "Delete the selected item.",
			icon: IconTrash,
			onClick: () => pressKey("Delete"),
		},
		{
			id: "escape",
			label: "Cancel",
			description: "Cancel the current command.",
			icon: IconX,
			onClick: () => pressKey("Escape"),
		},
		{
			id: "confirm",
			label: "Confirm",
			description: "Confirm the current command.",
			icon: IconCheck,
			onClick: () => pressKey("Enter"),
		},
	];

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
				className="fixed left-0 top-0 z-[999999] flex max-h-[72vh] flex-col rounded-md border bg-background/95 p-2 shadow-2xl backdrop-blur"
			>
				<div className="flex flex-col items-center gap-1">
					<Button
						variant="outline"
						className="os-pen-drag-handle h-10 w-10 cursor-grab rounded-xl active:cursor-grabbing"
					>
						<IconGripHorizontal className="h-5 w-5" />
					</Button>
				</div>

				<SidebarDivider />

				<div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto">
					{modeTools.length === 0 && (
						<IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground my-2" />
					)}
					{modeTools.map((tool) => {
						const Icon = getToolIcon(tool.command);

						return (
							<Tooltip key={tool.id}>
								<TooltipTrigger asChild>
									<MotionButton
										className="h-10 w-10 shrink-0 cursor-pointer"
										variant="outline"
										whileTap={{ scale: 0.94 }}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();

											executeOnshapeShortcutCommand(tool);
										}}
									>
										<Icon className="h-5 w-5" />
										{labelsVisible && (
											<span className="sr-only">{tool.command}</span>
										)}
									</MotionButton>
								</TooltipTrigger>

								<TooltipContent side="right">
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

				<SidebarDivider />

				<div className="flex flex-col items-center gap-1">
					{utilityActions.map((action) => (
						<UtilityButton key={action.id} action={action} />
					))}
				</div>
			</div>
		</Draggable>
	);
}
