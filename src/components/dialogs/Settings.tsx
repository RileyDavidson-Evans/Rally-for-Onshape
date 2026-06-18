import {
	Calculator,
	Code,
	Coffee,
	MessageCircle,
	Pencil,
	Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { EDIT_SHORTCUT_ITEMS_URL } from "@/constants/onshape";
import {
	BUY_ME_A_COFFEE_URL,
	DISCORD_LINK,
	GITHUB_URL,
} from "@/constants/social";
import { useExtensionSettings } from "@/contexts/ExtensionSettingsContext";
import { useOnshapeBridge } from "@/contexts/OnshapeBridgeContext";
import { useSettingsDialog } from "@/contexts/SettingsDialogContext";
import { isSafari } from "@/lib/utils";
import type { FloatingNumpadMode } from "@/storage/extensionStorage";
import { ONSHAPE_TOOLBAR_MODES, type OnshapeToolbarMode } from "@/types";
import { ButtonGroup } from "../ui/button-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SmartActionsCustomizer } from "./SmartFloatingActionsConfiguration";
import { ToolbarQuickActionsConfig } from "./ToolbarQuickActionsConfig";

const links = [
	{
		label: "Discord",
		description: "Join the community, report bugs, and request features.",
		icon: MessageCircle,
		href: DISCORD_LINK,
		target: "_blank",
	},
	{
		label: "GitHub",
		description: "View the source code, open issues, or contribute.",
		icon: Code,
		href: GITHUB_URL,
		target: "_blank",
	},
	{
		label: "Buy Me a Coffee",
		description: "Support development of Rally for Onshape.",
		icon: Coffee,
		href: BUY_ME_A_COFFEE_URL,
		target: "_blank",
		hidden: isSafari,
	},
].filter((item) => !(item.hidden?.() ?? false));

const floatingNumpadModes: {
	value: FloatingNumpadMode;
	label: string;
	description: string;
}[] = [
	{
		value: "auto",
		label: "Auto",
		description: "Show only when Rally for Onshape detects tablet mode.",
	},
	{
		value: "always",
		label: "Always",
		description: "Show whenever a supported input is focused.",
	},
	{
		value: "off",
		label: "Off",
		description: "Never show the floating numpad.",
	},
];

export function SettingsDialog() {
	const { isSettingsOpen, setSettingsOpen } = useSettingsDialog();
	const { allAvailableTools } = useOnshapeBridge();

	const partsStudioTools =
		allAvailableTools.find((t) => t.tabType === "Part Studio")?.commands || [];

	const { settings, setSetting } = useExtensionSettings();

	const getToolsForMode = (mode: OnshapeToolbarMode) =>
		allAvailableTools
			.find((toolGroup) => toolGroup.tabType === mode)
			?.commands.map((tool) => ({
				id: tool.command,
				label: tool.name?.replace("server:::", "") || tool.command,
				description: tool.expandedTooltipKey?.replace("tooltips:::", ""),
			})) ?? [];

	const availableToolsByMode = Object.fromEntries(
		ONSHAPE_TOOLBAR_MODES.map((mode) => [mode, getToolsForMode(mode)]),
	) as Record<
		OnshapeToolbarMode,
		{
			id: string;
			label: string;
			description?: string;
		}[]
	>;

	return (
		<Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
			<DialogContent
				className="
					max-w-[600px]! overflow-hidden rounded-2xl
					border border-white/10
					bg-gradient-to-b from-slate-900/95 via-slate-950/92 to-black/90
					p-0 text-white
					shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]
					backdrop-blur-xl
				"
			>
				<div className="relative">
					<div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/5 via-white/[0.015] to-transparent" />

					<div className="relative z-10 p-5">
						<DialogHeader className="mb-5">
							<DialogTitle className="text-lg font-semibold">
								Welcome to Rally for Onshape
							</DialogTitle>

							<DialogDescription className="text-sm text-slate-300">
								Customize your workflow, join the community, report bugs, or
								support development.
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-2">
							<div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 flex justify-between items-center">
								<div className="flex items-start gap-3 items-center">
									<div
										className="
										flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
										border border-white/10 bg-white/[0.06] text-blue-300
									"
									>
										<Calculator className="h-5 w-5" />
									</div>
									<div>
										<div className="text-sm font-medium text-slate-100">
											Floating Numpad
										</div>

										<div className="mt-1 text-xs leading-snug text-slate-300">
											Choose when the floating numeric keypad should appear.
										</div>
									</div>
								</div>

								<ButtonGroup>
									{floatingNumpadModes.map((mode) => {
										const isSelected =
											settings.floatingNumpadMode === mode.value;

										return (
											<Tooltip key={mode.value}>
												<TooltipTrigger asChild>
													<Button
														key={mode.value}
														type="button"
														variant="ghost"
														className={[
															"h-9 cursor-pointer rounded-lg border text-xs font-medium",
															isSelected
																? "border-blue-400/30 bg-blue-500/20 text-blue-100 hover:bg-blue-500/25"
																: "border-white/10 bg-white/[0.045] text-slate-300 hover:bg-white/10 hover:text-white",
														].join(" ")}
														onClick={() =>
															setSetting("floatingNumpadMode", mode.value)
														}
													>
														{mode.label}
													</Button>
												</TooltipTrigger>
												<TooltipContent>{mode.description}</TooltipContent>
											</Tooltip>
										);
									})}
								</ButtonGroup>
							</div>

							<SmartActionsCustomizer
								availableTools={partsStudioTools.map((t) => ({
									id: t.command,
									label: t.name?.replace("server:::", "") || "",
									description: t.expandedTooltipKey?.replace("tooltips:::", ""),
								}))}
							/>

							<ToolbarQuickActionsConfig
								availableToolsByMode={availableToolsByMode}
							/>

							{links.map((item) => {
								const Icon = item.icon;

								return (
									<a key={item.label} href={item.href} target={item.target}>
										<button
											type="button"
											className="
											group flex w-full cursor-pointer items-center gap-3 rounded-xl
											border border-white/10 bg-white/[0.045] p-3 text-left
											shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
											transition-all duration-150
											hover:border-white/15 hover:bg-white/[0.075]
											active:scale-[0.985]
										"
										>
											<div
												className="
												flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
												border border-white/10 bg-white/[0.06]
												text-blue-300
												group-hover:bg-blue-500/15 group-hover:text-blue-200
											"
											>
												<Icon className="h-5 w-5" />
											</div>

											<div className="min-w-0">
												<div className="text-sm font-medium text-slate-100">
													{item.label}
												</div>
												<div className="mt-0.5 text-xs leading-snug text-slate-300">
													{item.description}
												</div>
											</div>
										</button>
									</a>
								);
							})}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
