import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	fireInputEvents,
	pressKey,
	setNativeValue,
	suppressVirtualKeyboard,
} from "@/core/utils";
import { TEXT_ROWS } from "./keyboardConstants";
import {
	ACTION_DELAY,
	AUTO_HIDE_DELAY,
	type CadKey,
	type KeyboardMode,
	type Position,
} from "./keyboardTypes";
import {
	getKeyboardPosition,
	hasKeyboardModifiers,
	isEditableInput,
	isTypingTarget,
} from "./keyboardUtils";

export function useFloatingCadKeyboard() {
	const keyboardRef = useRef<HTMLDivElement | null>(null);
	const activeInputRef = useRef<HTMLElement | null>(null);
	const hideTimerRef = useRef<number | null>(null);

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

	const dispatchKeyboardKey = useCallback((keyConfig: CadKey) => {
		const el = activeInputRef.current;
		if (!el || !keyConfig.key) return;

		const eventInit = {
			key: keyConfig.key,
			code: keyConfig.code ?? "",
			keyCode: keyConfig.keyCode ?? 0,
			which: keyConfig.keyCode ?? 0,
			bubbles: false,
			cancelable: true,
			composed: false,
			shiftKey: keyConfig.modifiers?.shift ?? false,
			ctrlKey: keyConfig.modifiers?.ctrl ?? false,
			altKey: keyConfig.modifiers?.alt ?? false,
			metaKey: keyConfig.modifiers?.meta ?? false,
		};

		el.dispatchEvent(new KeyboardEvent("keydown", eventInit));
		el.dispatchEvent(new KeyboardEvent("keyup", eventInit));
	}, []);

	const insertText = useCallback((text: string) => {
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
	}, []);

	const deleteBackward = useCallback(() => {
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
	}, []);

	const clearInput = useCallback(() => {
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
	}, []);

	const moveCaret = useCallback(
		(direction: "left" | "right", shiftKey = false) => {
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
		},
		[dispatchKeyboardKey],
	);

	const sendCadKey = useCallback(
		(keyConfig: CadKey) => {
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
					activeInputRef.current?.blur();
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
		},
		[
			cancelPendingHide,
			clearInput,
			deleteBackward,
			dispatchKeyboardKey,
			hideKeyboard,
			insertText,
			isShift,
			mode,
			moveCaret,
		],
	);

	return {
		activeInputRef,
		cancelPendingHide,
		hideKeyboard,
		isShift,
		isVisible,
		keyboardRef,
		mode,
		position,
		sendCadKey,
		setIsShift,
		setMode,
		textKeys,
	};
}
