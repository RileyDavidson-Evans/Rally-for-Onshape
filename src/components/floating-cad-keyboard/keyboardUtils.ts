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
	const padHeight = keyboard?.offsetHeight || 360;

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
		"shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
		"transition-all duration-150 active:scale-95",
		key.className ?? "",
		isPrimary
			? "border-blue-400/30 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 hover:text-white"
			: "",
		isAction
			? "border-white/10 bg-white/[0.075] text-slate-200 hover:bg-white/12 hover:text-white"
			: "",
		isOperator
			? "border-cyan-400/20 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20 hover:text-white"
			: "",
		isUnit
			? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 hover:text-white"
			: "",
		isFunction
			? "border-purple-400/20 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20 hover:text-white"
			: "",
		!isPrimary && !isAction && !isOperator && !isUnit && !isFunction
			? "border-white/10 bg-white/[0.045] text-slate-100 hover:bg-white/10 hover:text-white"
			: "",
	].join(" ");
}
