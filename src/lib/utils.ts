import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
export const STORAGE_KEY = "onshapePenSidebarScreenPosition";

export const DEFAULT_POSITION = {
	x: 290,
	y: 100,
};

export const SIDEBAR_SAFE_MARGIN = 12;
export const SIDEBAR_MIN_VISIBLE_SIZE = 80;

export function getViewportSize() {
	const viewport = window.visualViewport;

	return {
		width: viewport?.width ?? window.innerWidth,
		height: viewport?.height ?? window.innerHeight,
	};
}

export function clampSidebarPosition(
	position: { x: number; y: number },
	fallback: { x: number; y: number },
) {
	const { width, height } = getViewportSize();

	const x = Number(position?.x);
	const y = Number(position?.y);

	if (!Number.isFinite(x) || !Number.isFinite(y)) return fallback;

	return {
		x: Math.min(
			Math.max(x, SIDEBAR_SAFE_MARGIN),
			Math.max(SIDEBAR_SAFE_MARGIN, width - SIDEBAR_MIN_VISIBLE_SIZE),
		),
		y: Math.min(
			Math.max(y, SIDEBAR_SAFE_MARGIN),
			Math.max(SIDEBAR_SAFE_MARGIN, height - SIDEBAR_MIN_VISIBLE_SIZE),
		),
	};
}

export function isSafari() {
	const userAgent = window.navigator.userAgent;

	return (
		/safari/i.test(userAgent) &&
		!/chrome|chromium|crios|fxios|edgios|opr|opera|android/i.test(userAgent)
	);
}
