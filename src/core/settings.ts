import type { FloatingNumpadMode } from "@/storage/extensionStorage";

export function shouldUseFloatingNumpad(mode: FloatingNumpadMode): boolean {
	switch (mode) {
		case "always":
			return true;

		case "off":
			return false;

		case "auto":
		default:
			return (
				navigator.maxTouchPoints > 0 &&
				window.matchMedia("(pointer: coarse)").matches
			);
	}
}
