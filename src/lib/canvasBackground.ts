import { CANVAS_BACKGROUND_PRESET_MAP } from "@/constants/canvasBackground";
import type {
	CanvasBackground,
	CanvasBackgroundPreset,
} from "@/storage/extensionStorage";
import { getStorageItem, watchStorageItem } from "@/storage/extensionStorage";

export function getCanvasBackgroundUrl(
	preset: CanvasBackgroundPreset,
	customUrl: string,
): string | null {
	if (preset === "none") {
		return null;
	}

	if (preset === "custom") {
		return customUrl.trim() || null;
	}

	return CANVAS_BACKGROUND_PRESET_MAP[preset]?.url ?? null;
}

let currentCanvasBackground: CanvasBackground | null = null;
let observer: MutationObserver | null = null;

function applyCanvasBackground(background: CanvasBackground) {
	currentCanvasBackground = background;

	const url = getCanvasBackgroundUrl(background.preset, background.customUrl);
	const canvases = document.querySelectorAll<HTMLCanvasElement>("canvas");

	for (const canvas of canvases) {
		canvas.style.background = url ? `url("${url}") !important` : "";
		canvas.style.backgroundSize = url ? "cover !important" : "";
		canvas.style.backgroundPosition = url ? "center !important" : "";
		canvas.style.backgroundRepeat = url ? "no-repeat !important" : "";

		// Optional, but nice if these work visually in your test.
		canvas.style.opacity = String(background.opacity);
		canvas.style.filter =
			background.blur > 0 ? `blur(${background.blur}px)` : "";
	}
}

export async function initCanvasBackground() {
	const initialBackground = await getStorageItem("canvasBackground");

	applyCanvasBackground(initialBackground);

	const unwatch = watchStorageItem("canvasBackground", (newBackground) => {
		applyCanvasBackground(newBackground);
	});

	observer = new MutationObserver(() => {
		if (currentCanvasBackground) {
			applyCanvasBackground(currentCanvasBackground);
		}
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});

	return () => {
		unwatch();
		observer?.disconnect();
		observer = null;
	};
}
