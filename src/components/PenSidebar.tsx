import {
	Check,
	Circle,
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
import { useEffect, useMemo, useRef, useState } from "react";
import {
	pressKey,
	subscribeToFeature,
	subscribeToRoute,
} from "../core/utils";

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

		["mousedown", "mouseup", "click"].forEach((type) => {
			okButton?.dispatchEvent(
				new MouseEvent(type, {
					bubbles: true,
					cancelable: true,
					view: window,
				}),
			);
		});
	}, 40);
}

function PenButton({ iconName, title, onClick }) {
	const Icon = ICONS[iconName];

	return (
		<button
			className="os-pen-btn"
			data-tooltip={title}
			type="button"
			onPointerDown={(e) => {
				e.preventDefault();
				e.stopPropagation();

				setTimeout(() => {
					onClick?.();
				}, 100);
			}}
		>
			{Icon ? <Icon size={20} strokeWidth={2} /> : null}
			<span className="os-pen-btn-label">{title}</span>
		</button>
	);
}

function Spacer() {
	return <div className="os-pen-btn-spacer" />;
}

export function PenSidebar() {
	const sidebarRef = useRef(null);
	const dragStateRef = useRef(null);

	const [route, setRoute] = useState(() => ({
		isDocumentPage: window.location.pathname.startsWith("/documents/"),
	}));

	const [featureType, setFeatureType] = useState(null);

	const [labelsVisible, setLabelsVisible] = useState(
		() => localStorage.getItem(LABEL_MODE_KEY) === "true",
	);

	useEffect(() => {
		return subscribeToRoute(setRoute);
	}, []);

	useEffect(() => {
		return subscribeToFeature(({ isFeatureOpen, featureType }) => {
			setFeatureType(isFeatureOpen ? featureType : null);
		});
	}, []);

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

	const items = useMemo(() => {
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

		const globalItems = [
			["panelLeft", "Toggle Labels", () => setLabelsVisible((value) => !value)],
			["keyboard", "Keyboard", () => setTimeout(showKeyboard, 100)],
			["fullscreen", "Fullscreen", toggleFullscreen],
			[
				"home",
				"Home",
				() => (window.location.href = "https://cad.onshape.com/documents"),
			],
		];

		const featureCommonItems = [
			["esc", "Cancel", cancelAction],
			["check", "Confirm", () => setTimeout(confirmAction, 100)],
		];

		const defaultDocumentItems = [
			["space", "Clear", clearSelectionAction],
			["search", "Shortcut Menu", shortcutMenuAction],
			["normal", "Normal To", normalToAction],
			["delete", "Delete", deleteAction],
		];

		const featureItemsByType = {
			newSketch: [
				["line", "Line", () => pressKey("l")],
				["circle", "Circle", () => pressKey("c")],
				["rectangle", "Rectangle", () => pressKey("r")],
				["dimension", "Dimension", () => pressKey("d")],
				["trim", "Trim", () => pressKey("t")],
				["offset", "Offset", () => pressKey("o")],
				["space", "Clear", clearSelectionAction],
				["search", "Shortcut Menu", shortcutMenuAction],
				["normal", "Normal To", normalToAction],
				["delete", "Delete", deleteAction],
			],

			extrude: [
				["search", "Shortcut Menu", shortcutMenuAction],
				["normal", "Normal To", normalToAction],
			],

			fillet: [
				["search", "Shortcut Menu", shortcutMenuAction],
				["normal", "Normal To", normalToAction],
			],

			chamfer: [
				["search", "Shortcut Menu", shortcutMenuAction],
				["normal", "Normal To", normalToAction],
			],
		};

		const featureSpecificItems = featureType
			? featureItemsByType[featureType] || [
					["search", "Shortcut Menu", shortcutMenuAction],
					["normal", "Normal To", normalToAction],
				]
			: defaultDocumentItems;

		return [
			...globalItems,
			"spacer",
			...(featureType ? featureCommonItems : []),
			...featureSpecificItems,
			"spacer",
			["undo", "Undo", undoAction],
			["redo", "Redo", redoAction],
		];
	}, [featureType]);

	if (!route.isDocumentPage) return null;

	return (
		<div
			ref={sidebarRef}
			id="os-pen-shortcut-sidebar"
			className={labelsVisible ? "os-labels-always-visible" : ""}
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
				className="os-pen-drag-handle"
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
				<div className="os-pen-dots">••</div>
			</div>

			<div className="os-pen-buttons">
				{items.map((item, index) => {
					if (item === "spacer") {
						return <Spacer key={`spacer-${item[0]}`} />;
					}

					const [iconName, title, onClick] = item;

					return (
						<PenButton
							key={`${iconName}-${title}-${iconName}`}
							iconName={iconName}
							title={title}
							onClick={onClick}
						/>
					);
				})}
			</div>
		</div>
	);
}
