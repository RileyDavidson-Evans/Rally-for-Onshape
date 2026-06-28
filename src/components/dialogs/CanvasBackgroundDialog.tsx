// CanvasBackgroundDialog.tsx

import { Check, ImageIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
	CANVAS_BACKGROUND_PRESET_MAP,
	CANVAS_BACKGROUND_PRESETS,
} from "@/constants/canvasBackground";
import { useExtensionSettings } from "@/contexts/ExtensionSettingsContext";
import type {
	CanvasBackground,
	CanvasBackgroundPreset,
} from "@/storage/extensionStorage";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

type CanvasBackgroundDialogProps = {
	children: ReactNode;
};

const PRESET_OPTIONS: Array<{
	id: CanvasBackgroundPreset;
	name: string;
	description: string;
	url?: string;
}> = [
	{
		id: "none",
		name: "None",
		description: "Use the default Onshape canvas.",
	},
	...CANVAS_BACKGROUND_PRESETS,
	{
		id: "custom",
		name: "Custom URL",
		description: "Use your own image URL.",
	},
];

export function CanvasBackgroundDialog({
	children,
}: CanvasBackgroundDialogProps) {
	const { settings, setSetting } = useExtensionSettings();
	const canvasBackground = settings.canvasBackground;

	const updateCanvasBackground = (patch: Partial<CanvasBackground>) => {
		setSetting("canvasBackground", {
			...canvasBackground,
			...patch,
		});
	};

	const selectedPreset =
		canvasBackground.preset !== "none" && canvasBackground.preset !== "custom"
			? CANVAS_BACKGROUND_PRESET_MAP[canvasBackground.preset]
			: null;

	const previewUrl =
		canvasBackground.preset === "custom"
			? canvasBackground.customUrl
			: selectedPreset?.url;

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Canvas Background</DialogTitle>
					<DialogDescription>
						Choose a background image for your Onshape workspace.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5">
					{previewUrl ? (
						<div
							className="h-36 rounded-xl border border-border bg-cover bg-center"
							style={{
								backgroundImage: `url("${previewUrl}")`,
								opacity: canvasBackground.opacity,
								filter: `blur(${canvasBackground.blur}px)`,
							}}
						/>
					) : (
						<div className="flex h-36 items-center justify-center rounded-xl border border-border bg-muted/40 text-sm text-muted-foreground">
							Default Onshape canvas
						</div>
					)}

					<div className="grid grid-cols-2 gap-3">
						{PRESET_OPTIONS.map((preset) => {
							const isSelected = canvasBackground.preset === preset.id;

							return (
								<button
									key={preset.id}
									type="button"
									onClick={() => updateCanvasBackground({ preset: preset.id })}
									className={`
										relative overflow-hidden rounded-xl border text-left transition-all
										${
											isSelected
												? "border-primary ring-2 ring-primary/20"
												: "border-border hover:border-primary/40"
										}
									`}
								>
									{preset.url ? (
										<div
											className="h-24 bg-cover bg-center"
											style={{ backgroundImage: `url("${preset.url}")` }}
										/>
									) : (
										<div className="flex h-24 items-center justify-center bg-muted/50">
											<ImageIcon className="h-6 w-6 text-muted-foreground" />
										</div>
									)}

									<div className="p-3">
										<div className="text-sm font-medium">{preset.name}</div>
										<div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
											{preset.description}
										</div>
									</div>

									{isSelected && (
										<div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground">
											<Check className="h-3.5 w-3.5" />
										</div>
									)}
								</button>
							);
						})}
					</div>

					{canvasBackground.preset === "custom" && (
						<div className="space-y-2">
							<Label htmlFor="canvas-background-url">Custom image URL</Label>
							<Input
								id="canvas-background-url"
								value={canvasBackground.customUrl}
								placeholder="https://images.unsplash.com/..."
								onChange={(event) =>
									updateCanvasBackground({
										customUrl: event.target.value,
									})
								}
							/>
						</div>
					)}

					<div className="space-y-3">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label>Opacity</Label>
								<span className="text-xs text-muted-foreground">
									{Math.round(canvasBackground.opacity * 100)}%
								</span>
							</div>

							<Slider
								min={0.05}
								max={1}
								step={0.05}
								value={[canvasBackground.opacity]}
								onValueChange={([opacity]) =>
									updateCanvasBackground({ opacity })
								}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label>Blur</Label>
								<span className="text-xs text-muted-foreground">
									{canvasBackground.blur}px
								</span>
							</div>

							<Slider
								min={0}
								max={20}
								step={1}
								value={[canvasBackground.blur]}
								onValueChange={([blur]) => updateCanvasBackground({ blur })}
							/>
						</div>
					</div>

					<div className="flex justify-end">
						<Button
							variant="secondary"
							onClick={() =>
								updateCanvasBackground({
									preset: "none",
									customUrl: "",
									opacity: 0.2,
									blur: 0,
								})
							}
						>
							Reset
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
