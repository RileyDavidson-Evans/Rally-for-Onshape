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
	const margin = 18;

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
		"!h-10 w-full cursor-pointer rounded-md border px-2",
		"text-sm font-semibold",
		"shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
		"transition-all duration-150 active:scale-95",
		key.className ?? "",

		isPrimary
			? "border-blue-500/30 bg-blue-500/12 text-blue-700 hover:bg-blue-500/20 hover:text-blue-800 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-100 dark:hover:bg-blue-500/30 dark:hover:text-white"
			: "",

		isAction
			? "border-slate-300/80 bg-slate-100/80 text-slate-700 hover:bg-slate-200 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.075] dark:text-slate-200 dark:hover:bg-white/12 dark:hover:text-white"
			: "",

		isOperator
			? "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/18 hover:text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-100 dark:hover:bg-cyan-500/20 dark:hover:text-white"
			: "",

		isUnit
			? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/18 hover:text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:bg-emerald-500/20 dark:hover:text-white"
			: "",

		isFunction
			? "border-purple-500/25 bg-purple-500/10 text-purple-700 hover:bg-purple-500/18 hover:text-purple-800 dark:border-purple-400/20 dark:bg-purple-500/10 dark:text-purple-100 dark:hover:bg-purple-500/20 dark:hover:text-white"
			: "",

		!isPrimary && !isAction && !isOperator && !isUnit && !isFunction
			? "border-slate-300/80 bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white"
			: "",
	].join(" ");
}
