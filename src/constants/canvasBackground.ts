import type { CanvasBackgroundPreset } from "@/storage/extensionStorage";

export type CanvasBackgroundPresetDefinition = {
	id: Exclude<CanvasBackgroundPreset, "none" | "custom">;
	name: string;
	description: string;
	url: string;
};

export const CANVAS_BACKGROUND_PRESETS: CanvasBackgroundPresetDefinition[] = [
	{
		id: "space",
		name: "Deep Space",
		description: "A stunning view of the cosmos.",
		url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2560&q=80&auto=format&fit=crop",
	},
	{
		id: "mountains",
		name: "Mountain Vista",
		description: "Snow-capped peaks and endless horizons.",
		url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2560&q=80&auto=format&fit=crop",
	},
	{
		id: "lake",
		name: "Alpine Lake",
		description: "A peaceful mountain lake reflection.",
		url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2560&q=80&auto=format&fit=crop",
	},
	{
		id: "forest",
		name: "Forest Mist",
		description: "A calm forest covered in morning fog.",
		url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2560&q=80&auto=format&fit=crop",
	},
	{
		id: "aurora",
		name: "Aurora",
		description: "Northern lights illuminating the night sky.",
		url: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=2560&q=80&auto=format&fit=crop",
	},
];

export const CANVAS_BACKGROUND_PRESET_MAP = Object.fromEntries(
	CANVAS_BACKGROUND_PRESETS.map((preset) => [preset.id, preset]),
) as Record<
	CanvasBackgroundPresetDefinition["id"],
	CanvasBackgroundPresetDefinition
>;
