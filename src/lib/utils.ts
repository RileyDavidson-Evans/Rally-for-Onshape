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

export const getInitialPosition = () => {
	const fallback = { x: DEFAULT_POSITION.x, y: DEFAULT_POSITION.y };

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return fallback;

		const parsed = JSON.parse(raw);

		const x = Number(parsed?.x);
		const y = Number(parsed?.y);

		const isValid =
			Number.isFinite(x) &&
			Number.isFinite(y) &&
			x >= 0 &&
			y >= 0 &&
			x <= window.innerWidth - 80 &&
			y <= window.innerHeight - 80;

		return isValid ? { x, y } : fallback;
	} catch {
		return fallback;
	}
};
