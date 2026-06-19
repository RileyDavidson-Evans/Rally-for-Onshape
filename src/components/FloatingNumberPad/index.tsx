import { Settings, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSettingsDialog } from "@/contexts/SettingsDialogContext";
import {
	fireInputEvents,
	pressKey,
	setNativeValue,
	suppressVirtualKeyboard,
} from "@/core/utils";

const ACTION_DELAY = 40;
const AUTO_HIDE_DELAY = 600;

type KeyboardMode = "numbers" | "text" | "symbols";

type Position = {
	left: number;
	top: number;
};

type EditableInput = HTMLInputElement | HTMLTextAreaElement;

type KeyModifiers = {
	shift?: boolean;
	ctrl?: boolean;
	alt?: boolean;
	meta?: boolean;
};

type CadKey = {
	label: string;
	value?: string;
	key?: string;
	code?: string;
	keyCode?: number;
	type?: "text" | "action" | "operator" | "unit" | "function" | "primary";
	modifiers?: KeyModifiers;
	className?: string;
};

const NUMBER_KEYS: CadKey[] = [
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

const UNIT_KEYS: CadKey[] = [
	{ label: "mm", value: "mm", type: "unit" },
	{ label: "cm", value: "cm", type: "unit" },
	{ label: "m", value: "m", type: "unit" },
	{ label: "in", value: "in", type: "unit" },
	{ label: "ft", value: "ft", type: "unit" },
	{ label: "deg", value: "deg", type: "unit" },
];

const FUNCTION_KEYS: CadKey[] = [
	{ label: "sin", value: "sin(", type: "function" },
	{ label: "cos", value: "cos(", type: "function" },
	{ label: "tan", value: "tan(", type: "function" },
	{ label: "sqrt", value: "sqrt(", type: "function" },
];

const SYMBOL_KEYS: CadKey[] = [
	{
		label: "#",
		value: "#",
		key: "3",
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

const COMMAND_KEYS: CadKey[] = [
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

const TEXT_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

function isEditableInput(el: HTMLElement): el is EditableInput {
	return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}

function isTypingTarget(el: EventTarget | null): el is HTMLElement {
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

function getKeyboardPosition(
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

function hasKeyboardModifiers(key: CadKey) {
	return Boolean(
		key.modifiers?.shift ||
			key.modifiers?.ctrl ||
			key.modifiers?.alt ||
			key.modifiers?.meta,
	);
}

export function FloatingNumpad() {
	const keyboardRef = useRef<HTMLDivElement | null>(null);
	const activeInputRef = useRef<HTMLElement | null>(null);
	const hideTimerRef = useRef<number | null>(null);

	const { openSettings } = useSettingsDialog();

	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState<Position>({ left: 0, top: 0 });
	const [mode, setMode] = useState<KeyboardMode>("numbers");
	const [isShift, setIsShift] = useState(false);

	const textKeys = useMemo(() => {
		return TEXT_ROWS.map((row) =>
			row.split("").map<CadKey>((char) => {
				const upper = char.toUpperCase();

				return {
					label: isShift ? upper : char,
					value: isShift ? upper : char,
					key: char,
					code: `Key${upper}`,
					keyCode: upper.charCodeAt(0),
					modifiers: isShift ? { shift: true } : undefined,
				};
			}),
		);
	}, [isShift]);

	const cancelPendingHide = useCallback(() => {
		if (hideTimerRef.current === null) return;
		window.clearTimeout(hideTimerRef.current);
		hideTimerRef.current = null;
	}, []);

	const hideKeyboard = useCallback(() => {
		setIsVisible(false);
		activeInputRef.current = null;
		hideTimerRef.current = null;
		setMode("numbers");
		setIsShift(false);
	}, []);

	const scheduleAutoHide = useCallback(() => {
		cancelPendingHide();

		hideTimerRef.current = window.setTimeout(() => {
			const focused = document.activeElement;
			const activeInput = activeInputRef.current;
			const keyboard = keyboardRef.current;

			if (
				activeInput &&
				focused !== activeInput &&
				focused !== document.body &&
				focused !== document.documentElement &&
				!keyboard?.contains(focused)
			) {
				hideKeyboard();
			}
		}, AUTO_HIDE_DELAY);
	}, [cancelPendingHide, hideKeyboard]);

	const handleFocusIn = useCallback(
		(e: FocusEvent) => {
			const target = e.target;
			const keyboard = keyboardRef.current;

			if (!isTypingTarget(target)) return;
			if (keyboard?.contains(target)) return;

			cancelPendingHide();
			activeInputRef.current = target;

			requestAnimationFrame(() => {
				setPosition(getKeyboardPosition(target, keyboardRef.current));
				setIsVisible(true);
			});
		},
		[cancelPendingHide],
	);

	const handleFocusOut = useCallback(
		(e: FocusEvent) => {
			const activeInput = activeInputRef.current;
			const keyboard = keyboardRef.current;

			if (!activeInput) return;

			if (
				e.relatedTarget instanceof Node &&
				keyboard?.contains(e.relatedTarget)
			) {
				return;
			}

			scheduleAutoHide();
		},
		[scheduleAutoHide],
	);

	useEffect(() => {
		const cleanupKeyboardSuppression = suppressVirtualKeyboard();

		window.addEventListener("focusin", handleFocusIn, true);
		window.addEventListener("focusout", handleFocusOut, true);

		return () => {
			cleanupKeyboardSuppression();

			window.removeEventListener("focusin", handleFocusIn, true);
			window.removeEventListener("focusout", handleFocusOut, true);

			if (hideTimerRef.current !== null) {
				window.clearTimeout(hideTimerRef.current);
				hideTimerRef.current = null;
			}
		};
	}, [handleFocusIn, handleFocusOut]);

	function dispatchKeyboardKey(keyConfig: CadKey) {
		const el = activeInputRef.current;
		if (!el || !keyConfig.key) return;

		const eventInit = {
			key: keyConfig.key,
			code: keyConfig.code ?? "",
			keyCode: keyConfig.keyCode ?? 0,
			which: keyConfig.keyCode ?? 0,
			bubbles: true,
			cancelable: true,
			shiftKey: keyConfig.modifiers?.shift ?? false,
			ctrlKey: keyConfig.modifiers?.ctrl ?? false,
			altKey: keyConfig.modifiers?.alt ?? false,
			metaKey: keyConfig.modifiers?.meta ?? false,
		};

		el.dispatchEvent(new KeyboardEvent("keydown", eventInit));
		el.dispatchEvent(new KeyboardEvent("keyup", eventInit));

		window.setTimeout(() => {
			pressKey(keyConfig.key!, {
				code: eventInit.code,
				keyCode: eventInit.keyCode,
				which: eventInit.which,
				shiftKey: eventInit.shiftKey,
				ctrlKey: eventInit.ctrlKey,
				altKey: eventInit.altKey,
				metaKey: eventInit.metaKey,
			});
		}, 30);
	}

	function insertText(text: string) {
		const el = activeInputRef.current;
		if (!el) return;

		if (isEditableInput(el)) {
			const start = el.selectionStart ?? el.value.length;
			const end = el.selectionEnd ?? el.value.length;
			const oldValue = el.value ?? "";
			const newValue = oldValue.slice(0, start) + text + oldValue.slice(end);
			const nextPos = start + text.length;

			setNativeValue(el, newValue);
			el.setSelectionRange?.(nextPos, nextPos);
			fireInputEvents(el, "insertText", text);
			return;
		}

		if (el.isContentEditable) {
			document.execCommand("insertText", false, text);
		}
	}

	function deleteBackward() {
		const el = activeInputRef.current;
		if (!el) return;

		if (isEditableInput(el)) {
			const start = el.selectionStart ?? el.value.length;
			const end = el.selectionEnd ?? el.value.length;
			const oldValue = el.value ?? "";

			let newValue: string;
			let nextPos: number;

			if (start === end && start > 0) {
				newValue = oldValue.slice(0, start - 1) + oldValue.slice(end);
				nextPos = start - 1;
			} else {
				newValue = oldValue.slice(0, start) + oldValue.slice(end);
				nextPos = start;
			}

			setNativeValue(el, newValue);
			el.setSelectionRange?.(nextPos, nextPos);
			fireInputEvents(el, "deleteContentBackward", null);
			return;
		}

		if (el.isContentEditable) {
			document.execCommand("delete");
		}
	}

	function clearInput() {
		const el = activeInputRef.current;
		if (!el) return;

		if (isEditableInput(el)) {
			setNativeValue(el, "");
			el.setSelectionRange?.(0, 0);
			fireInputEvents(el, "deleteContentBackward", null);
			return;
		}

		if (el.isContentEditable) {
			document.execCommand("selectAll");
			document.execCommand("delete");
		}
	}

	function moveCaret(direction: "left" | "right", shiftKey = false) {
		const el = activeInputRef.current;
		if (!el) return;

		if (isEditableInput(el) && !shiftKey) {
			const pos = el.selectionStart ?? el.value.length;
			const nextPos =
				direction === "left"
					? Math.max(0, pos - 1)
					: Math.min(el.value.length, pos + 1);

			el.setSelectionRange?.(nextPos, nextPos);
			return;
		}

		dispatchKeyboardKey({
			label: direction === "left" ? "←" : "→",
			key: direction === "left" ? "ArrowLeft" : "ArrowRight",
			code: direction === "left" ? "ArrowLeft" : "ArrowRight",
			keyCode: direction === "left" ? 37 : 39,
			modifiers: shiftKey ? { shift: true } : undefined,
		});
	}

	function sendCadKey(keyConfig: CadKey) {
		const el = activeInputRef.current;
		if (!el) return;

		cancelPendingHide();
		el.focus();

		if (keyConfig.key === "Backspace") {
			deleteBackward();
			return;
		}

		if (keyConfig.key === "Clear") {
			clearInput();
			return;
		}

		if (keyConfig.key === "ArrowLeft") {
			moveCaret("left", keyConfig.modifiers?.shift);
			return;
		}

		if (keyConfig.key === "ArrowRight") {
			moveCaret("right", keyConfig.modifiers?.shift);
			return;
		}

		if (
			keyConfig.key === "Enter" ||
			keyConfig.key === "Escape" ||
			keyConfig.key === "Tab"
		) {
			dispatchKeyboardKey(keyConfig);

			if (keyConfig.key === "Enter" || keyConfig.key === "Escape") {
				window.setTimeout(() => {
					hideKeyboard();
				}, ACTION_DELAY);
			}

			return;
		}

		const shouldDispatchOnly =
			keyConfig.modifiers?.ctrl ||
			keyConfig.modifiers?.alt ||
			keyConfig.modifiers?.meta;

		if (shouldDispatchOnly) {
			dispatchKeyboardKey(keyConfig);
			return;
		}

		if (keyConfig.value) {
			if (hasKeyboardModifiers(keyConfig)) {
				dispatchKeyboardKey(keyConfig);
			}

			insertText(keyConfig.value);

			if (isShift && mode === "text") {
				setIsShift(false);
			}

			return;
		}

		dispatchKeyboardKey(keyConfig);
	}

	function keyClassName(key: CadKey) {
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

	function renderKey(key: CadKey) {
		return (
			<Button
				key={`${key.label}-${key.value ?? key.key}`}
				className={keyClassName(key)}
				variant="ghost"
				tabIndex={-1}
				type="button"
				onPointerDown={(e) => {
					e.preventDefault();
					e.stopPropagation();
					cancelPendingHide();

					window.setTimeout(() => {
						activeInputRef.current?.focus();
						sendCadKey(key);
					}, ACTION_DELAY);
				}}
			>
				{key.label}
			</Button>
		);
	}

	return (
		<Card
			ref={keyboardRef}
			id="os-floating-cad-keyboard"
			tabIndex={-1}
			className={[
				"fixed z-[999999] w-[360px] select-none overflow-hidden rounded-md",
				"border border-white/10",
				"os-plus-glass",
				"p-2 backdrop-blur-xl",
				"transition-opacity duration-300 ease-out",
				"before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]",
				"before:bg-gradient-to-b before:from-white/5 before:via-white/[0.015] before:to-transparent",
				"after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/5",
				isVisible
					? "pointer-events-auto scale-100 opacity-100"
					: "pointer-events-none scale-95 opacity-0",
			].join(" ")}
			style={{
				left: `${position.left}px`,
				top: `${position.top}px`,
			}}
			onPointerDown={(e) => {
				e.preventDefault();
				e.stopPropagation();
				cancelPendingHide();
			}}
		>
			<div className="relative z-10">
				<div className="flex items-center justify-between px-1 pb-2">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]" />

						<span className="text-xs font-semibold tracking-[0.18em] text-slate-400">
							CAD KEYBOARD
						</span>
					</div>

					<div className="flex gap-1">
						<Button
							className="h-7 w-7 cursor-pointer"
							variant="ghost"
							size="icon"
							type="button"
							tabIndex={-1}
							onPointerDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
								openSettings();
							}}
						>
							<Settings />
						</Button>

						<Button
							className="h-7 w-7 cursor-pointer rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
							variant="ghost"
							size="icon"
							type="button"
							tabIndex={-1}
							onPointerDown={(e) => {
								e.preventDefault();
								e.stopPropagation();

								cancelPendingHide();

								window.setTimeout(() => {
									hideKeyboard();
								}, ACTION_DELAY);
							}}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<Separator className="mb-2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				<div className="mb-2 grid grid-cols-3 gap-1.5">
					<Button
						className="!h-8 rounded-md text-xs font-semibold"
						variant="ghost"
						tabIndex={-1}
						type="button"
						onPointerDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setMode("numbers");
						}}
					>
						123
					</Button>
					<Button
						className="!h-8 rounded-md text-xs font-semibold"
						variant="ghost"
						tabIndex={-1}
						type="button"
						onPointerDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setMode("text");
						}}
					>
						ABC
					</Button>
					<Button
						className="!h-8 rounded-md text-xs font-semibold"
						variant="ghost"
						tabIndex={-1}
						type="button"
						onPointerDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setMode("symbols");
						}}
					>
						# &amp; ()
					</Button>
				</div>

				{mode === "numbers" && (
					<>
						<div className="mb-2 grid grid-cols-6 gap-1.5">
							{UNIT_KEYS.map(renderKey)}
						</div>
						<div className="mb-2 grid grid-cols-4 gap-1.5">
							{FUNCTION_KEYS.map(renderKey)}
						</div>
						<div className="grid grid-cols-4 gap-1.5">
							{NUMBER_KEYS.map(renderKey)}
						</div>
					</>
				)}

				{mode === "text" && (
					<div className="space-y-1.5">
						{textKeys.map((row, rowIndex) => (
							<div
								key={`text-row-${rowIndex}`}
								className={[
									"grid gap-1.5",
									rowIndex === 0 ? "grid-cols-10" : "",
									rowIndex === 1 ? "grid-cols-9 px-4" : "",
									rowIndex === 2 ? "grid-cols-7 px-8" : "",
								].join(" ")}
							>
								{row.map(renderKey)}
							</div>
						))}

						<div className="grid grid-cols-5 gap-1.5">
							<Button
								className={[
									"!h-10 cursor-pointer rounded-md border text-sm font-semibold",
									isShift
										? "border-blue-400/30 bg-blue-500/20 text-blue-100"
										: "border-white/10 bg-white/[0.075] text-slate-200",
								].join(" ")}
								variant="ghost"
								tabIndex={-1}
								type="button"
								onPointerDown={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setIsShift((value) => !value);
								}}
							>
								Shift
							</Button>

							{renderKey(SYMBOL_KEYS[0])}
							{renderKey({
								label: "_",
								value: "_",
								key: "-",
								code: "Minus",
								keyCode: 189,
								modifiers: { shift: true },
							})}
							{renderKey({
								label: "Space",
								value: " ",
								key: " ",
								code: "Space",
								keyCode: 32,
								type: "action",
							})}
							{renderKey({
								label: "⌫",
								key: "Backspace",
								code: "Backspace",
								keyCode: 8,
								type: "action",
							})}
						</div>
					</div>
				)}

				{mode === "symbols" && (
					<div className="grid grid-cols-4 gap-1.5">
						{SYMBOL_KEYS.map(renderKey)}
						{FUNCTION_KEYS.map(renderKey)}
					</div>
				)}

				<Separator className="my-2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				<div className="grid grid-cols-5 gap-1.5">
					{COMMAND_KEYS.map(renderKey)}
				</div>
			</div>
		</Card>
	);
}
