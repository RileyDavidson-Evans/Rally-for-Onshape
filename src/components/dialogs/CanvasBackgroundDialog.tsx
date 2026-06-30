// CanvasBackgroundDialog.tsx

import { Check, ImageIcon, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import {
	CANVAS_BACKGROUND_PRESET_MAP,
	CANVAS_BACKGROUND_PRESETS,
} from "@/constants/canvasBackground";
import { useExtensionSettings } from "@/contexts/ExtensionSettingsContext";
import { applyCanvasBackground } from "@/lib/canvasBackground";
import {
	type CanvasBackground,
	type CanvasBackgroundPreset,
	DEFAULT_STORAGE_VALUES,
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
		const newSettingConfig = {
			...canvasBackground,
			...patch,
		};

		setSetting("canvasBackground", newSettingConfig);
		applyCanvasBackground(newSettingConfig);
	};

	const selectedPreset =
		canvasBackground.preset !== "none" && canvasBackground.preset !== "custom"
			? CANVAS_BACKGROUND_PRESET_MAP[canvasBackground.preset]
			: null;

	const previewUrl =
		canvasBackground.preset === "custom"
			? canvasBackground.customUrl
			: selectedPreset?.url;

	const resetCanvasBackground = () => {
		updateCanvasBackground(DEFAULT_STORAGE_VALUES.canvasBackground);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent className="w-[min(92vw,980px)] max-w-none! p-0">
				<div className="grid max-h-[78vh] grid-cols-[1.05fr_0.95fr] overflow-hidden">
					<section className="border-r border-border p-6">
						<DialogHeader>
							<DialogTitle>Canvas Background</DialogTitle>
							<DialogDescription>
								Choose a background image for your Onshape workspace.
							</DialogDescription>
						</DialogHeader>

						<div className="mt-5 grid grid-cols-2 gap-3 overflow-y-auto pr-1">
							{PRESET_OPTIONS.map((preset) => {
								const isSelected = canvasBackground.preset === preset.id;

								return (
									<button
										key={preset.id}
										type="button"
										onClick={() =>
											updateCanvasBackground({ preset: preset.id })
										}
										className={`
											group relative cursor-pointer overflow-hidden rounded-xl border bg-card text-left
											transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm
											${
												isSelected
													? "border-primary shadow-sm ring-2 ring-primary/20"
													: "border-border"
											}
										`}
									>
										{preset.url ? (
											<div
												className="h-20 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
												style={{ backgroundImage: `url("${preset.url}")` }}
											/>
										) : (
											<div className="flex h-20 items-center justify-center bg-muted/50">
												<ImageIcon className="h-5 w-5 text-muted-foreground" />
											</div>
										)}

										<div className="p-3">
											<div className="flex items-center justify-between gap-2">
												<div className="truncate text-sm font-medium">
													{preset.name}
												</div>

												{isSelected && (
													<div className="shrink-0 rounded-full bg-primary p-1 text-primary-foreground">
														<Check className="h-3 w-3" />
													</div>
												)}
											</div>

											<div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
												{preset.description}
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</section>

					<section className="flex flex-col gap-5 bg-muted/20 p-6">
						<div>
							<div className="mb-2 flex items-center justify-between">
								<Label>Preview</Label>

								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-8 gap-1.5 text-xs"
									onClick={resetCanvasBackground}
								>
									<RotateCcw className="h-3.5 w-3.5" />
									Reset
								</Button>
							</div>

							{previewUrl ? (
								<div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
									<div
										className="h-56 bg-cover bg-center"
										style={{
											backgroundImage: `url("${previewUrl}")`,
											opacity: canvasBackground.opacity,
											filter: `blur(${canvasBackground.blur}px)`,
										}}
									/>
								</div>
							) : (
								<div className="flex h-56 items-center justify-center rounded-2xl border border-border bg-background text-sm text-muted-foreground shadow-sm">
									Default Onshape canvas
								</div>
							)}
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

						<div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
							<div className="grid gap-5">
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
						</div>
					</section>
				</div>
			</DialogContent>
		</Dialog>
	);
}
