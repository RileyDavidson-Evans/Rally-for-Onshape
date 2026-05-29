import {
	Check,
	Circle,
	GripVertical,
	Home,
	Keyboard,
	Maximize,
	Minus,
	MousePointer2,
	PanelLeft,
	RectangleHorizontal,
	Redo2,
	Ruler,
	Scissors,
	Search,
	Slash,
	Trash2,
	Undo2,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { actions } from "@/features/actions";
import { featureDefinitions } from "@/features/definitions";
import type { IconName, ToolDefinition } from "@/features/types";
import { pressKey, subscribeToFeature, subscribeToRoute } from "../core/utils";

const STORAGE_KEY = "onshapePenSidebarPosition";
const LABEL_MODE_KEY = "onshapePenSidebarLabelsAlwaysVisible";

const ICONS = {
	check: Check,
	circle: Circle,
	delete: Trash2,
	dimension: Ruler,
	esc: X,
	fullscreen: Maximize,
	home: Home,
	keyboard: Keyboard,
	line: Slash,
	normal: MousePointer2,
	offset: Minus,
	panelLeft: PanelLeft,
	rectangle: RectangleHorizontal,
	redo: Redo2,
	search: Search,
	space: MousePointer2,
	trim: Scissors,
	undo: Undo2,
};

type ToolItem = {
	type: "button";
	id: string;
	iconName: IconName;
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

function showKeyboard() {
	try {
		navigator.virtualKeyboard?.show?.();
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

function confirmAction() {
	pressKey("Enter", {
		code: "Enter",
		keyCode: 13,
		which: 13,
	});

	setTimeout(() => {
		const okButton = document.querySelector(".ns-dialog-button-ok.button-ok");

		for (const type of ["mousedown", "mouseup", "click"]) {
			okButton?.dispatchEvent(
				new MouseEvent(type, {
					bubbles: true,
					cancelable: true,
					view: window,
				}),
			);
		}
	}, 40);
}

function PenButton({ iconName, title, onClick, tone = "default" }: ToolItem) {
	const Icon = ICONS[iconName];

	const toneClass =
		tone === "primary"
			? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
			: tone === "success"
				? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
				: tone === "danger"
					? "bg-destructive/15 text-destructive hover:bg-destructive/25"
					: "text-foreground/85 hover:bg-accent hover:text-accent-foreground";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					tabIndex={-1}
					className={[
						"os-pen-btn group relative h-11 w-11 overflow-hidden rounded-2xl",
						"border border-transparent transition-[background,border-color,transform,box-shadow] duration-150",
						"active:scale-95",
						toneClass,
					].join(" ")}
					onPointerDown={(e) => {
						e.preventDefault();
						e.stopPropagation();
						e.currentTarget.blur();

						setTimeout(() => {
							onClick();
						}, 80);
					}}
				>
					<span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
						<span className="absolute inset-x-2 top-1 h-px bg-white/25" />
					</span>

					<Icon className="h-5 w-5" strokeWidth={2} />

					<span className="os-pen-btn-label pointer-events-none ml-2 hidden text-xs font-medium">
						{title}
					</span>
				</Button>
			</TooltipTrigger>

			<TooltipContent
				side="right"
				sideOffset={10}
				className="border-border/70 bg-popover/95 text-popover-foreground shadow-xl backdrop-blur-xl"
			>
				<p>{title}</p>
			</TooltipContent>
		</Tooltip>
	);
}

function AnimatedItem({ item }: { item: MenuItem }) {
	if (item.type === "spacer") {
		return (
			<motion.div
				layout
				initial={{ opacity: 0, scaleX: 0.4 }}
				animate={{ opacity: 1, scaleX: 1 }}
				exit={{ opacity: 0, scaleX: 0.4 }}
				transition={{ type: "spring", stiffness: 500, damping: 40 }}
				className="flex w-full justify-center"
			>
				<Separator className="my-1.5 w-8 bg-border/70" />
			</motion.div>
		);
	}

	if (item.type === "label") {
		return (
			<motion.div
				layout
				initial={{ opacity: 0, y: -4 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -4 }}
				transition={{ duration: 0.12 }}
				className="max-w-12 truncate px-1 pt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/75"
			>
				{item.title}
			</motion.div>
		);
	}

	return (
		<motion.div
			layout
			initial={{ opacity: 0, scale: 0.72, y: -6 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.72, y: 6 }}
			transition={{
				type: "spring",
				stiffness: 650,
				damping: 42,
				mass: 0.75,
			}}
		>
			<PenButton {...item} />
		</motion.div>
	);
}

export function PenSidebar() {
	const sidebarRef = useRef<HTMLDivElement | null>(null);
	const dragStateRef = useRef<{
		startX: number;
		startY: number;
		startLeft: number;
		startTop: number;
	} | null>(null);

	const [route, setRoute] = useState(() => ({
		isDocumentPage: window.location.pathname.startsWith("/documents/"),
	}));

	const [featureType, setFeatureType] = useState<string | null>(null);

	const [labelsVisible, setLabelsVisible] = useState(
		() => localStorage.getItem(LABEL_MODE_KEY) === "true",
	);

	useEffect(() => subscribeToRoute(setRoute), []);

	useEffect(
		() =>
			subscribeToFeature(({ isFeatureOpen, featureType }) => {
				setFeatureType(isFeatureOpen ? featureType : null);
			}),
		[],
	);

	useEffect(() => {
		localStorage.setItem(LABEL_MODE_KEY, String(labelsVisible));
	}, [labelsVisible]);

	useEffect(() => {
		const sidebar = sidebarRef.current;
		if (!sidebar) return;

		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

		if (saved) {
			sidebar.style.left = `${saved.left}px`;
			sidebar.style.top = `${saved.top}px`;
			sidebar.style.transform = "none";
		} else {
			sidebar.style.left = "12px";
			sidebar.style.top = "50%";
			sidebar.style.transform = "translateY(-50%)";
		}
	}, []);

	const items = useMemo<MenuItem[]>(() => {
		const cancelAction = () =>
			pressKey("Escape", {
				code: "Escape",
				keyCode: 27,
				which: 27,
			});

		const clearSelectionAction = () =>
			pressKey(" ", {
				code: "Space",
				keyCode: 32,
				which: 32,
			});

		const shortcutMenuAction = () => pressKey("s");
		const normalToAction = () => pressKey("n");
		const undoAction = () => pressKey("z", { ctrlKey: true });
		const redoAction = () => pressKey("y", { ctrlKey: true });
		const deleteAction = () =>
			pressKey("Delete", {
				code: "Delete",
				keyCode: 46,
				which: 46,
			});

		const button = (
			id: string,
			iconName: IconName,
			title: string,
			onClick: () => void,
			tone?: ToolItem["tone"],
		): ToolItem => ({
			type: "button",
			id,
			iconName,
			title,
			onClick,
			tone,
		});

		const spacer = (id: string): SpacerItem => ({ type: "spacer", id });

		const label = (id: string, title: string): SectionLabelItem => ({
			type: "label",
			id,
			title,
		});

		const globalItems: MenuItem[] = [
			button("labels", "panelLeft", "Labels", () =>
				setLabelsVisible((value) => !value),
			),
			button("keyboard", "keyboard", "Keyboard", () =>
				setTimeout(showKeyboard, 100),
			),
			button("fullscreen", "fullscreen", "Fullscreen", toggleFullscreen),
			button("home", "home", "Home", () => {
				window.location.href = "https://cad.onshape.com/documents";
			}),
		];

		const featureCommonItems: MenuItem[] = [
			label(
				"feature-label",
				featureDefinitions[featureType ?? ""]?.label ?? "Feature",
			),
			button("cancel", "esc", "Cancel", cancelAction, "danger"),
			button(
				"confirm",
				"check",
				"Confirm",
				() => setTimeout(confirmAction, 100),
				"success",
			),
		];

		const defaultDocumentItems: MenuItem[] = [
			label("view-label", "View"),
			button("clear", "space", "Clear", clearSelectionAction),
			button("shortcut-menu", "search", "Shortcut Menu", shortcutMenuAction),
			button("normal-to", "normal", "Normal To", normalToAction),
			button("delete", "delete", "Delete", deleteAction, "danger"),
		];

		const mapFeatureTool = (tool: ToolDefinition): ToolItem => ({
			type: "button",
			id: tool.id,
			iconName: tool.iconName,
			title: tool.title,
			onClick: actions[tool.action as keyof typeof actions] ?? (() => {}),
			tone: tool.tone,
		});

		const featureSpecificItems = featureType
			? (featureDefinitions[featureType]?.tools.map(mapFeatureTool) ?? [
					label("feature-tools-label", "Tools"),
					button(
						"shortcut-menu",
						"search",
						"Shortcut Menu",
						shortcutMenuAction,
					),
					button("normal-to", "normal", "Normal To", normalToAction),
				])
			: defaultDocumentItems;

		return [
			...globalItems,
			spacer("global-spacer"),
			...(featureType ? [...featureCommonItems, spacer("feature-spacer")] : []),
			...featureSpecificItems,
			spacer("history-spacer"),
			label("history-label", "History"),
			button("undo", "undo", "Undo", undoAction),
			button("redo", "redo", "Redo", redoAction),
		];
	}, [featureType]);

	if (!route.isDocumentPage) return null;

	return (
		<TooltipProvider delayDuration={120}>
			<motion.div
				ref={sidebarRef}
				id="os-pen-shortcut-sidebar"
				layout
				transition={{
					layout: {
						type: "spring",
						stiffness: 500,
						damping: 44,
					},
				}}
				className={[
					"fixed z-[999999]",
					"flex flex-col items-center gap-1",
					"rounded-[1.35rem] border border-white/10 bg-zinc-950/72 p-1.5 text-zinc-50 shadow-2xl shadow-black/40 backdrop-blur-2xl",
					"ring-1 ring-white/10",
					labelsVisible ? "os-labels-always-visible" : "",
				].join(" ")}
				onPointerMove={(e) => {
					const state = dragStateRef.current;
					const sidebar = sidebarRef.current;

					if (!state || !sidebar) return;

					const nextLeft = state.startLeft + e.clientX - state.startX;
					const nextTop = state.startTop + e.clientY - state.startY;

					const maxLeft = window.innerWidth - sidebar.offsetWidth - 8;
					const maxTop = window.innerHeight - sidebar.offsetHeight - 8;

					sidebar.style.left = `${Math.max(8, Math.min(nextLeft, maxLeft))}px`;
					sidebar.style.top = `${Math.max(8, Math.min(nextTop, maxTop))}px`;
				}}
				onPointerUp={(e) => {
					const sidebar = sidebarRef.current;

					if (!dragStateRef.current || !sidebar) return;

					dragStateRef.current = null;
					sidebar.classList.remove("is-dragging");

					const rect = sidebar.getBoundingClientRect();

					localStorage.setItem(
						STORAGE_KEY,
						JSON.stringify({
							left: Math.round(rect.left),
							top: Math.round(rect.top),
						}),
					);

					try {
						sidebar.releasePointerCapture(e.pointerId);
					} catch {}
				}}
			>
				<div
					className="os-pen-drag-handle flex h-5 w-11 cursor-grab touch-none items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300 active:cursor-grabbing"
					onPointerDown={(e) => {
						const sidebar = sidebarRef.current;
						if (!sidebar) return;

						e.preventDefault();
						e.stopPropagation();

						const rect = sidebar.getBoundingClientRect();

						dragStateRef.current = {
							startX: e.clientX,
							startY: e.clientY,
							startLeft: rect.left,
							startTop: rect.top,
						};

						sidebar.style.transform = "none";
						sidebar.classList.add("is-dragging");
						sidebar.setPointerCapture(e.pointerId);
					}}
				>
					<GripVertical className="h-3.5 w-3.5" strokeWidth={2.2} />
				</div>

				<motion.div
					layout
					className="os-pen-buttons flex flex-col items-center gap-1"
				>
					<AnimatePresence mode="popLayout" initial={false}>
						{items.map((item) => (
							<AnimatedItem key={item.id} item={item} />
						))}
					</AnimatePresence>
				</motion.div>
			</motion.div>
		</TooltipProvider>
	);
}
