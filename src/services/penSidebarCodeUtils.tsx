import {
	Check,
	Focus,
	MousePointerBan,
	Redo,
	ScanEye,
	ScanSearch,
	Trash2,
	Undo,
	X,
} from "lucide-react";
import { clickElement, pressKey } from "@/core/utils";
import type { UtilityAction } from "@/types";

export const topUtilityActions: UtilityAction[] = [
	{
		id: "undo",
		label: "Undo",
		description: "Undo the last action.",
		icon: Undo,
		onClick: () =>
			document.activeElement?.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "z",
					code: "KeyZ",
					ctrlKey: true,
					bubbles: true,
					cancelable: true,
				}),
			),
	},
	{
		id: "redo",
		label: "Redo",
		description: "Redo the last undone action.",
		icon: Redo,
		onClick: () =>
			document.activeElement?.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "y",
					code: "KeyY",
					ctrlKey: true,
					bubbles: true,
					cancelable: true,
				}),
			),
	},
	{
		id: "confirm",
		label: "Confirm",
		description: "Confirm the current command.",
		className: "bg-emerald-800 text-white",
		icon: Check,
		onClick: () => {
			clickElement("#feature-dialog .ns-dialog-button-ok");
		},
	},
	{
		id: "escape",
		label: "Cancel",
		description: "Cancel the current command.",
		className: "bg-red-800 text-white",
		icon: X,
		onClick: () => {
			clickElement("#feature-dialog .ns-dialog-button-cancel");
		},
	},
] as const;

export const topUtilityActionsExtended: UtilityAction[] = [
	{
		id: "space",
		label: "Clear Selection",
		description: "Clear the current selection.",
		icon: MousePointerBan,
		onClick: () =>
			pressKey(" ", {
				code: "Space",
				keyCode: 32,
				which: 32,
			}),
	},
	{
		id: "delete",
		label: "Delete",
		description: "Delete the selected item.",
		icon: Trash2,
		onClick: () => pressKey("Delete"),
	},
	{
		id: "focus",
		label: "Focus",
		description: "Auto orient the view to the selected item(s).",
		icon: ScanEye,
		onClick: () => pressKey("n"),
	},
	{
		id: "fit",
		label: "Fit View",
		description: "Zoom to fit all geometry in view.",
		icon: ScanSearch,
		onClick: () => pressKey("f"),
	},
] as const;
