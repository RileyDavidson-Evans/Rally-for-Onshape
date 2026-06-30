// CanvasBackgroundDialog.tsx

import {
	AlertCircle,
	Check,
	ExternalLink,
	HelpCircle,
	ImageIcon,
	Loader2,
	RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

type CanvasBackgroundDialogProps = {
	children: ReactNode;
};

type ImageStatus = "idle" | "loading" | "valid" | "invalid";

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

const BACKGROUND_IMAGE_LINKS = [
	{
		name: "Unsplash",
		url: "https://unsplash.com/backgrounds",
	},
	{
		name: "Pexels",
		url: "https://www.pexels.com/search/background/",
	},
	{
		name: "Pixabay",
		url: "https://pixabay.com/images/search/background/",
	},
];

export function CanvasBackgroundDialog({
	children,
}: CanvasBackgroundDialogProps) {
	const { settings, setSetting } = useExtensionSettings();
	const canvasBackground = settings.canvasBackground;

	const [customImageStatus, setCustomImageStatus] =
		useState<ImageStatus>("idle");

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
			? canvasBackground.customUrl.trim()
			: selectedPreset?.url;

	const isCustomSelected = canvasBackground.preset === "custom";

	const customImageFeedback = useMemo(() => {
		if (!isCustomSelected || !canvasBackground.customUrl.trim()) {
			return null;
		}

		if (customImageStatus === "loading") {
			return {
				icon: Loader2,
				className: "text-muted-foreground",
				message: "Checking image...",
			};
		}

		if (customImageStatus === "valid") {
			return {
				icon: Check,
				className: "text-emerald-500",
				message: "Image loaded successfully.",
			};
		}

		if (customImageStatus === "invalid") {
			return {
				icon: AlertCircle,
				className: "text-destructive",
				message:
					"This image URL could not be loaded. Try copying the direct image address.",
			};
		}

		return null;
	}, [canvasBackground.customUrl, customImageStatus, isCustomSelected]);

	useEffect(() => {
		if (!isCustomSelected) {
			setCustomImageStatus("idle");
			return;
		}

		const url = canvasBackground.customUrl.trim();

		if (!url) {
			setCustomImageStatus("idle");
			return;
		}

		setCustomImageStatus("loading");

		const image = new Image();

		image.onload = () => {
			setCustomImageStatus("valid");
		};

		image.onerror = () => {
			setCustomImageStatus("invalid");
		};

		image.src = url;

		return () => {
			image.onload = null;
			image.onerror = null;
		};
	}, [canvasBackground.customUrl, isCustomSelected]);

	const resetCanvasBackground = () => {
		updateCanvasBackground(DEFAULT_STORAGE_VALUES.canvasBackground);
	};

	return (
		<TooltipProvider>
			<Dialog>
				<DialogTrigger asChild>{children}</DialogTrigger>

				<DialogContent className="w-[min(92vw,980px)] max-w-none! p-0">
					<div className="grid h-[min(78vh,720px)] grid-cols-[1.05fr_0.95fr] overflow-hidden">
						<section className="flex min-h-0 flex-col border-r border-border p-6">
							<DialogHeader>
								<DialogTitle>Canvas Background</DialogTitle>
								<DialogDescription>
									Choose a background image for your Onshape workspace.
								</DialogDescription>
							</DialogHeader>

							<div className="mt-5 grid flex-1 grid-cols-2 gap-3 overflow-y-auto pr-1">
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

						<section className="flex min-h-0 flex-col gap-5 overflow-y-auto bg-muted/20 p-6">
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

							{isCustomSelected && (
								<div className="space-y-3">
									<div className="space-y-2">
										<div className="flex items-center gap-1.5">
											<Label htmlFor="canvas-background-url">
												Custom image URL
											</Label>

											<Tooltip>
												<TooltipTrigger asChild>
													<button
														type="button"
														className="cursor-help rounded-full text-muted-foreground transition-colors hover:text-foreground"
													>
														<HelpCircle className="h-3.5 w-3.5" />
													</button>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p>
														Use a direct image link. On most websites,
														right-click the image and choose{" "}
														<strong>Copy image address</strong> or{" "}
														<strong>Copy image URL</strong>.
													</p>
												</TooltipContent>
											</Tooltip>
										</div>

										<Input
											id="canvas-background-url"
											value={canvasBackground.customUrl}
											placeholder="https://images.unsplash.com/..."
											aria-invalid={customImageStatus === "invalid"}
											onChange={(event) =>
												updateCanvasBackground({
													customUrl: event.target.value,
												})
											}
										/>

										{customImageFeedback && (
											<div
												className={`flex items-center gap-1.5 text-xs ${customImageFeedback.className}`}
											>
												<customImageFeedback.icon
													className={`h-3.5 w-3.5 ${
														customImageStatus === "loading"
															? "animate-spin"
															: ""
													}`}
												/>
												<span>{customImageFeedback.message}</span>
											</div>
										)}
									</div>

									<div className="rounded-xl border border-border bg-background p-3">
										<div className="text-xs font-medium">Find free images</div>

										<div className="mt-2 flex flex-wrap gap-2">
											{BACKGROUND_IMAGE_LINKS.map((link) => (
												<a
													key={link.url}
													href={link.url}
													target="_blank"
													rel="noreferrer"
													className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
												>
													{link.name}
													<ExternalLink className="h-3 w-3" />
												</a>
											))}
										</div>
									</div>
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
											onValueChange={([blur]) =>
												updateCanvasBackground({ blur })
											}
										/>
									</div>
								</div>
							</div>
						</section>
					</div>
				</DialogContent>
			</Dialog>
		</TooltipProvider>
	);
}