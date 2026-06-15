import { Settings, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

type NumpadKey = [label: string, value: string, className?: string];

const KEYS: NumpadKey[] = [
	["7", "7"],
	["8", "8"],
	["9", "9"],
	["+", "+"],

	["4", "4"],
	["5", "5"],
	["6", "6"],
	["−", "-"],

	["1", "1"],
	["2", "2"],
	["3", "3"],
	["×", "*"],

	["0", "0"],
	[".", "."],
	["/", "/"],
	["⌫", "Backspace"],

	["Enter", "Enter", "wide"],
];

type Position = {
	left: number;
	top: number;
};

type EditableInput = HTMLInputElement | HTMLTextAreaElement;

function isUsefulInput(el: EventTarget | null): el is HTMLElement {
	return el instanceof HTMLElement && el.classList.contains("os-param-number");
}

function isEditableInput(el: HTMLElement): el is EditableInput {
	return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}

function getNumpadPosition(
	input: HTMLElement,
	numpad: HTMLDivElement | null,
): Position {
	const rect = input.getBoundingClientRect();
	const margin = 70;

	const padWidth = numpad?.offsetWidth || 400;
	const padHeight = numpad?.offsetHeight || 330;

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

export function FloatingNumpad() {
	const numpadRef = useRef<HTMLDivElement | null>(null);
	const activeInputRef = useRef<HTMLElement | null>(null);
	const hideTimerRef = useRef<number | null>(null);

	const { openSettings } = useSettingsDialog();

	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState<Position>({ left: 0, top: 0 });

	const cancelPendingHide = useCallback(() => {
		if (hideTimerRef.current === null) return;

		window.clearTimeout(hideTimerRef.current);
		hideTimerRef.current = null;
	}, []);

	const hideNumpad = useCallback(() => {
		setIsVisible(false);
		activeInputRef.current = null;
		hideTimerRef.current = null;
	}, []);

	const scheduleAutoHide = useCallback(() => {
		cancelPendingHide();

		hideTimerRef.current = window.setTimeout(() => {
			const focused = document.activeElement;
			const activeInput = activeInputRef.current;
			const numpad = numpadRef.current;

			if (
				activeInput &&
				focused !== activeInput &&
				focused !== document.body &&
				focused !== document.documentElement &&
				!numpad?.contains(focused)
			) {
				hideNumpad();
			}
		}, AUTO_HIDE_DELAY);
	}, [cancelPendingHide, hideNumpad]);

	const handleFocusIn = useCallback(
		(e: FocusEvent) => {
			const target = e.target;
			const numpad = numpadRef.current;

			if (!isUsefulInput(target)) return;
			if (numpad?.contains(target)) return;

			cancelPendingHide();

			activeInputRef.current = target;

			requestAnimationFrame(() => {
				setPosition(getNumpadPosition(target, numpadRef.current));
				setIsVisible(true);
			});
		},
		[cancelPendingHide],
	);

	const handleFocusOut = useCallback(
		(e: FocusEvent) => {
			const activeInput = activeInputRef.current;
			const numpad = numpadRef.current;

			if (!activeInput) return;

			if (
				e.relatedTarget instanceof Node &&
				numpad?.contains(e.relatedTarget)
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

	function sendInputKey(key: string) {
		const el = activeInputRef.current;
		if (!el) return;

		cancelPendingHide();
		el.focus();

		if (key === "Enter") {
			const enterEvent = {
				key: "Enter",
				code: "Enter",
				keyCode: 13,
				which: 13,
				bubbles: true,
				cancelable: true,
			};

			el.dispatchEvent(new KeyboardEvent("keydown", enterEvent));
			el.dispatchEvent(new KeyboardEvent("keyup", enterEvent));

			window.setTimeout(() => {
				pressKey("Enter", {
					code: "Enter",
					keyCode: 13,
					which: 13,
				});
			}, 30);

			window.setTimeout(() => {
				hideNumpad();
			}, ACTION_DELAY);

			return;
		}

		if (key === "Tab") {
			pressKey("Tab", {
				code: "Tab",
				keyCode: 9,
				which: 9,
			});

			return;
		}

		if (isEditableInput(el)) {
			const start = el.selectionStart ?? el.value.length;
			const end = el.selectionEnd ?? el.value.length;
			const oldValue = el.value ?? "";

			let newValue: string;
			let nextPos: number;

			if (key === "Backspace") {
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
			} else {
				newValue = oldValue.slice(0, start) + key + oldValue.slice(end);
				nextPos = start + key.length;

				setNativeValue(el, newValue);
				el.setSelectionRange?.(nextPos, nextPos);
				fireInputEvents(el, "insertText", key);
			}

			return;
		}

		if (el.isContentEditable) {
			if (key === "Backspace") {
				document.execCommand("delete");
			} else {
				document.execCommand("insertText", false, key);
			}
		}
	}

	return (
		<Card
			ref={numpadRef}
			id="os-floating-numpad"
			tabIndex={-1}
			className={[
				"fixed z-[999999] w-[230px] select-none overflow-hidden rounded-2xl",
				"border border-white/10",
				"bg-gradient-to-b from-slate-900/95 via-slate-950/92 to-black/90",
				"p-2 backdrop-blur-xl",
				"shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]",
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
							NUM
						</span>
					</div>

					<div className="flex gap-1">
						<Button
							className="h-7 w-7 cursor-pointer"
							variant="ghost"
							size="icon"
							onClick={openSettings}
						>
							<Settings />
						</Button>

						<Button
							className="h-7 w-7 cursor-pointer rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
							variant="ghost"
							size="icon"
							type="button"
							tabIndex={-1}
							onPointerDown={(e) => {
								e.preventDefault();
								e.stopPropagation();

								cancelPendingHide();

								window.setTimeout(() => {
									hideNumpad();
								}, ACTION_DELAY);
							}}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<Separator className="mb-2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				<div className="grid grid-cols-4 gap-1.5">
					{KEYS.map(([label, key]) => {
						const isEnter = key === "Enter";
						const isBackspace = key === "Backspace";
						const isOperator = ["+", "-", "*", "/"].includes(key);

						return (
							<Button
								key={`${label}-${key}`}
								className={[
									"!h-12 w-full cursor-pointer rounded-xl border",
									"text-base font-semibold",
									"shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
									"transition-all duration-150 active:scale-95",

									isEnter
										? "col-span-4 border-blue-400/30 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 hover:text-white"
										: "",

									isOperator || isBackspace
										? "border-white/10 bg-white/[0.075] text-slate-200 hover:bg-white/12 hover:text-white"
										: "",

									!isEnter && !isOperator && !isBackspace
										? "border-white/10 bg-white/[0.045] text-slate-100 hover:bg-white/10 hover:text-white"
										: "",
								].join(" ")}
								variant="ghost"
								tabIndex={-1}
								type="button"
								onPointerDown={(e) => {
									e.preventDefault();
									e.stopPropagation();

									cancelPendingHide();

									window.setTimeout(() => {
										activeInputRef.current?.focus();
										sendInputKey(key);
									}, ACTION_DELAY);
								}}
							>
								{label}
							</Button>
						);
					})}
				</div>
			</div>
		</Card>
	);
}
