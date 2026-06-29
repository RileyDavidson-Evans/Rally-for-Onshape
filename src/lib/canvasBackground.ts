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
let observer: MutationObserver | null = null;

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

function applyCanvasBackground(background: CanvasBackground) {
	currentCanvasBackground = background;

	const url = getCanvasBackgroundUrl(background.preset, background.customUrl);
	const canvases = document.querySelectorAll<HTMLCanvasElement>("canvas");

	for (const canvas of canvases) {
		const layer = getOrCreateBackgroundLayer(canvas);
		if (!layer) continue;

		if (!url) {
			layer.remove();
			continue;
		}
		document.documentElement.style.setProperty(
			"--rally-canvas-background",
			"transparent",
		);

		layer.style.backgroundImage = `url("${url}")`;
		layer.style.backgroundSize = "cover";
		layer.style.backgroundPosition = "center";
		layer.style.backgroundRepeat = "no-repeat";
		layer.style.opacity = String(background.opacity);
		layer.style.filter =
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

		document
			.querySelectorAll(`.${BACKGROUND_LAYER_CLASS}`)
			.forEach((layer) => layer.remove());
	};
}
