import { CANVAS_BACKGROUND_PRESET_MAP } from "@/constants/canvasBackground";
import type {
	CanvasBackground,
	CanvasBackgroundPreset,
} from "@/storage/extensionStorage";
import { getStorageItem, watchStorageItem } from "@/storage/extensionStorage";

const BACKGROUND_LAYER_CLASS = "rally-canvas-background-layer";

export function getCanvasBackgroundUrl(
	preset: CanvasBackgroundPreset,
	customUrl: string,
): string | null {
	if (preset === "none") return null;
	if (preset === "custom") return customUrl.trim() || null;

	return CANVAS_BACKGROUND_PRESET_MAP[preset]?.url ?? null;
}

let currentCanvasBackground: CanvasBackground | null = null;
const observer: MutationObserver | null = null;

function getOrCreateBackgroundLayer(canvas: HTMLCanvasElement) {
	const parent = canvas.parentElement;
	if (!parent) return null;

	let layer = parent.querySelector<HTMLDivElement>(
		`:scope > .${BACKGROUND_LAYER_CLASS}`,
	);

	if (!layer) {
		layer = document.createElement("div");
		layer.className = BACKGROUND_LAYER_CLASS;

		layer.style.position = "absolute";
		layer.style.inset = "0";
		layer.style.pointerEvents = "none";
		layer.style.zIndex = "0";

		parent.insertBefore(layer, canvas);
	}

	const parentPosition = window.getComputedStyle(parent).position;
	if (parentPosition === "static") {
		parent.style.position = "relative";
	}

	canvas.style.position = canvas.style.position || "relative";
	canvas.style.zIndex = "1";

	return layer;
}

export function applyCanvasBackground(background: CanvasBackground) {
	currentCanvasBackground = background;

	const url = getCanvasBackgroundUrl(background.preset, background.customUrl);
	const canvases = document.querySelectorAll<HTMLCanvasElement>("canvas");

	for (const canvas of canvases) {
		const layer = getOrCreateBackgroundLayer(canvas);
		if (!layer) continue;

		if (!url) {
			document
				.querySelector("#viewerdiv")
				?.classList.remove("canvas-bg-enabled");
			layer.remove();
			continue;
		}
		document.querySelector("#viewerdiv")?.classList.add("canvas-bg-enabled");

		layer.style.backgroundImage = `url("${url}")`;
		layer.style.backgroundSize = "cover";
		layer.style.backgroundPosition = "center";
		layer.style.backgroundRepeat = "no-repeat";
		layer.style.opacity = String(background.opacity);
		layer.style.filter =
			background.blur > 0 ? `blur(${background.blur}px)` : "";
	}
}
