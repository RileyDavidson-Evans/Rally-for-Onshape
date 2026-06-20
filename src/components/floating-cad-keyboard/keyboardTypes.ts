export const ACTION_DELAY = 40;
export const AUTO_HIDE_DELAY = 600;

export type KeyboardMode = "numbers" | "text" | "symbols";

export type Position = {
	left: number;
	top: number;
};

export type EditableInput = HTMLInputElement | HTMLTextAreaElement;

export type KeyModifiers = {
	shift?: boolean;
	ctrl?: boolean;
	alt?: boolean;
	meta?: boolean;
};

export type CadKey = {
	label: string;
	value?: string;
	key?: string;
	code?: string;
	keyCode?: number;
	type?: "text" | "action" | "operator" | "unit" | "function" | "primary";
	modifiers?: KeyModifiers;
	className?: string;
};
