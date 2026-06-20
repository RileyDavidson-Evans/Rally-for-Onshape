import type { CadKey } from "./keyboardTypes";

export const NUMBER_KEYS: CadKey[] = [
	{ label: "7", value: "7", key: "7", code: "Digit7", keyCode: 55 },
	{ label: "8", value: "8", key: "8", code: "Digit8", keyCode: 56 },
	{ label: "9", value: "9", key: "9", code: "Digit9", keyCode: 57 },
	{
		label: "+",
		value: "+",
		key: "=",
		code: "Equal",
		keyCode: 187,
		modifiers: { shift: true },
		type: "operator",
	},
	{ label: "4", value: "4", key: "4", code: "Digit4", keyCode: 52 },
	{ label: "5", value: "5", key: "5", code: "Digit5", keyCode: 53 },
	{ label: "6", value: "6", key: "6", code: "Digit6", keyCode: 54 },
	{
		label: "−",
		value: "-",
		key: "-",
		code: "Minus",
		keyCode: 189,
		type: "operator",
	},
	{ label: "1", value: "1", key: "1", code: "Digit1", keyCode: 49 },
	{ label: "2", value: "2", key: "2", code: "Digit2", keyCode: 50 },
	{ label: "3", value: "3", key: "3", code: "Digit3", keyCode: 51 },
	{
		label: "×",
		value: "*",
		key: "8",
		code: "Digit8",
		keyCode: 56,
		modifiers: { shift: true },
		type: "operator",
	},
	{ label: "0", value: "0", key: "0", code: "Digit0", keyCode: 48 },
	{ label: ".", value: ".", key: ".", code: "Period", keyCode: 190 },
	{
		label: "/",
		value: "/",
		key: "/",
		code: "Slash",
		keyCode: 191,
		type: "operator",
	},
	{
		label: "⌫",
		key: "Backspace",
		code: "Backspace",
		keyCode: 8,
		type: "action",
	},
];

export const UNIT_KEYS: CadKey[] = [
	{ label: "mm", value: "mm", type: "unit" },
	{ label: "cm", value: "cm", type: "unit" },
	{ label: "m", value: "m", type: "unit" },
	{ label: "in", value: "in", type: "unit" },
	{ label: "ft", value: "ft", type: "unit" },
	{ label: "deg", value: "deg", type: "unit" },
];

export const FUNCTION_KEYS: CadKey[] = [
	{ label: "sin", value: "sin(", type: "function" },
	{ label: "cos", value: "cos(", type: "function" },
	{ label: "tan", value: "tan(", type: "function" },
	{ label: "sqrt", value: "sqrt(", type: "function" },
];

export const SYMBOL_KEYS: CadKey[] = [
	{
		label: "#",
		value: "#",
		key: "#",
		code: "Digit3",
		keyCode: 51,
		modifiers: { shift: true },
		type: "operator",
	},
	{
		label: "(",
		value: "(",
		key: "9",
		code: "Digit9",
		keyCode: 57,
		modifiers: { shift: true },
	},
	{
		label: ")",
		value: ")",
		key: "0",
		code: "Digit0",
		keyCode: 48,
		modifiers: { shift: true },
	},
	{
		label: "=",
		value: "=",
		key: "=",
		code: "Equal",
		keyCode: 187,
		type: "operator",
	},
	{
		label: "_",
		value: "_",
		key: "-",
		code: "Minus",
		keyCode: 189,
		modifiers: { shift: true },
	},
	{
		label: "<",
		value: "<",
		key: ",",
		code: "Comma",
		keyCode: 188,
		modifiers: { shift: true },
	},
	{
		label: ">",
		value: ">",
		key: ".",
		code: "Period",
		keyCode: 190,
		modifiers: { shift: true },
	},
	{
		label: "⌫",
		key: "Backspace",
		code: "Backspace",
		keyCode: 8,
		type: "action",
	},
	{ label: "π", value: "pi", type: "function" },
	{ label: ",", value: ",", key: ",", code: "Comma", keyCode: 188 },
	{
		label: ":",
		value: ":",
		key: ";",
		code: "Semicolon",
		keyCode: 186,
		modifiers: { shift: true },
	},
	{
		label: "Space",
		value: " ",
		key: " ",
		code: "Space",
		keyCode: 32,
		type: "action",
	},
];

export const COMMAND_KEYS: CadKey[] = [
	{
		label: "←",
		key: "ArrowLeft",
		code: "ArrowLeft",
		keyCode: 37,
		type: "action",
	},
	{
		label: "→",
		key: "ArrowRight",
		code: "ArrowRight",
		keyCode: 39,
		type: "action",
	},
	{ label: "Clear", key: "Clear", type: "action" },
	{ label: "Esc", key: "Escape", code: "Escape", keyCode: 27, type: "action" },
	{ label: "Enter", key: "Enter", code: "Enter", keyCode: 13, type: "primary" },
];

export const TEXT_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

export const TEXT_SYMBOL_KEYS: CadKey[] = [
	SYMBOL_KEYS[0],
	{
		label: "_",
		value: "_",
		key: "-",
		code: "Minus",
		keyCode: 189,
		modifiers: { shift: true },
	},
	{
		label: "Space",
		value: " ",
		key: " ",
		code: "Space",
		keyCode: 32,
		type: "action",
	},
	{
		label: "⌫",
		key: "Backspace",
		code: "Backspace",
		keyCode: 8,
		type: "action",
	},
];
