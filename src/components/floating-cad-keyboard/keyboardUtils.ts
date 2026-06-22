import type { CadKey, EditableInput, Position } from "./keyboardTypes";

export function isEditableInput(el: HTMLElement): el is EditableInput {
	return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}

export function isTypingTarget(el: EventTarget | null): el is HTMLElement {
	if (!(el instanceof HTMLElement)) return false;
	if (el.closest("#os-floating-cad-keyboard")) return false;
	if (el.isContentEditable) return true;

	if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
		return false;
	}

	return ![
		"button",
		"checkbox",
		"color",
		"file",
		"hidden",
		"image",
		"radio",
		"range",
		"reset",
		"submit",
	].includes(el.type?.toLowerCase());
}

export function getKeyboardPosition(
	input: HTMLElement,
	keyboard: HTMLDivElement | null,
): Position {
	const rect = input.getBoundingClientRect();
	const margin = 80;

	const padWidth = keyboard?.offsetWidth || 360;
	const padHeight = keyboard?.offsetHeight || 450;

	let left = rect.right + margin;
	let top = rect.top;

	if (left + padWidth > window.innerWidth - margin) {
		left = rect.left - padWidth - margin;
	}

	if (left < margin) {
		left = window.innerWidth - padWidth - margin;
	}

	if (top + padHeight > window.innerHeight - margin) {
		top = window.innerHeight - padHeight - margin;
	}

	if (top < margin) {
		top = margin;
	}

	return { left, top };
}

export function hasKeyboardModifiers(key: CadKey) {
	return Boolean(
		key.modifiers?.shift ||
			key.modifiers?.ctrl ||
			key.modifiers?.alt ||
			key.modifiers?.meta,
	);
}

export function cadKeyClassName(key: CadKey) {
	const isPrimary = key.type === "primary";
	const isAction = key.type === "action";
	const isOperator = key.type === "operator";
	const isUnit = key.type === "unit";
	const isFunction = key.type === "function";

	return [
		"transition-colors",
		key.className ?? "",

		// Enter / Confirm
		isPrimary
			? "bg-green-200 text-green-700 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-800 dark:text-green-200"
			: "",

		// Navigation / Esc / Clear
		isAction
			? "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
			: "",

		// Math operators
		isOperator
			? "bg-cyan-100 text-cyan-900 hover:bg-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:hover:bg-cyan-900"
			: "",

		// Units
		isUnit
			? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900"
			: "",

		// Functions
		isFunction
			? "bg-violet-100 text-violet-900 hover:bg-violet-200 dark:bg-violet-950 dark:text-violet-200 dark:hover:bg-violet-900"
			: "",
	].join(" ");
}
