import { ChevronDown, RotateCcw, Settings, X, Zap } from "lucide-react";
import { useState } from "react";
import { CommandMultiSelect } from "@/components/shared/CommandMultiSelect";
import { Button } from "@/components/ui/button";
import { useExtensionSettings } from "@/contexts/ExtensionSettingsContext";
import { cn } from "@/lib/utils";
import {
	DEFAULT_STORAGE_VALUES,
	type RadialMenuConfig,
} from "@/storage/extensionStorage";
import { Switch } from "../ui/switch";

export type SmartActionToolOption = {
	id: string;
	label: string;
	description?: string;
};

type SmartActionsCustomizerProps = {
	availableTools: SmartActionToolOption[];
};

const SMART_ACTION_SECTIONS: {
	key: keyof RadialMenuConfig;
	label: string;
	description: string;
}[] = [
	{
		key: "singleFace",
		label: "Single Face",
		description: "Actions shown when one face is selected.",
	},
	{
		key: "singleEdge",
		label: "Single Edge",
		description: "Actions shown when one edge is selected.",
	},
	{
		key: "multipleFaces",
		label: "Multiple Faces",
		description: "Actions shown when multiple faces are selected.",
	},
	{
		key: "multipleEdges",
		label: "Multiple Edges",
		description: "Actions shown when multiple edges are selected.",
	},
];

export function SmartActionsCustomizer({
	availableTools,
}: SmartActionsCustomizerProps) {
	const { settings, updateSetting, setSetting } = useExtensionSettings();
	const [isExpanded, setIsExpanded] = useState(false);

	const setSectionTools = async (
		sectionKey: keyof RadialMenuConfig,
		toolIds: string[],
	) => {
		await updateSetting("radialMenuConfig", (config) => ({
			...config,
			[sectionKey]: toolIds,
		}));
	};

	const resetSection = async (sectionKey: keyof RadialMenuConfig) => {
		await updateSetting("radialMenuConfig", (config) => ({
			...config,
			[sectionKey]: DEFAULT_STORAGE_VALUES.radialMenuConfig[sectionKey],
		}));
	};

	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.035]">
			<button
				type="button"
				className="
					flex w-full items-center gap-3 p-3 text-left
					transition-colors hover:bg-white/[0.04] cursor-pointer
				"
				onClick={(event) => {
					event.stopPropagation();
					setIsExpanded((current) => !current);
				}}
			>
				<div
					className="
						flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
						border border-white/10 bg-white/[0.06] text-blue-300
					"
				>
					<Zap className="h-5 w-5" />
				</div>

				<div className="min-w-0 flex-1">
					<div className="text-sm font-medium text-slate-100">
						Quick Actions
					</div>

					<div className="mt-1 text-xs leading-snug text-slate-300">
						Choose which actions appear when selecting faces and edges in Part
						Studio.
					</div>
				</div>

				<div className="flex items-center gap-4">
					<Button size="icon" variant={"ghost"}>
						<ChevronDown
							className={cn(
								"h-5 w-5 shrink-0 cursor-pointer text-slate-200 transition-transform",
								isExpanded && "rotate-180",
							)}
						/>
					</Button>
				</div>
			</button>

			{isExpanded && (
				<div className="border-t border-white/10 p-3 pt-2">
					<div className="flex flex-col gap-3">
						<div className="rounded-lg border border-white/10 bg-black/15 p-3">
							<div className="flex items-center justify-between gap-3">
								<div className="min-w-0">
									<div className="font-medium text-slate-100">Enabled</div>
								</div>

								<div className="flex items-center gap-3">
									<Switch
										checked={settings.smartActionsEnabled}
										onCheckedChange={(value) =>
											setSetting("smartActionsEnabled", value)
										}
									/>
								</div>
							</div>
						</div>
						{SMART_ACTION_SECTIONS.map((section) => {
							const selectedToolIds = settings.radialMenuConfig[section.key];

							return (
								<div
									key={section.key}
									className="rounded-lg border border-white/10 bg-black/15 p-3"
								>
									<div className="flex items-center justify-between gap-3">
										<div className="min-w-0">
											<div className="font-medium text-slate-100">
												{section.label}
											</div>
										</div>

										<div className="flex items-center gap-3">
											<CommandMultiSelect
												value={selectedToolIds}
												options={availableTools}
												onChange={(toolIds) =>
													setSectionTools(section.key, toolIds)
												}
												placeholder="Select actions"
												searchPlaceholder="Search actions..."
												emptyMessage="No actions found."
												maxSelected={7}
												maxSelectedMessage="Select up to 7 actions."
											/>

											<Button
												type="button"
												variant="ghost"
												className="
													shrink-0 cursor-pointer rounded-md border border-white/10
													bg-white/[0.045] px-2 text-[11px] text-slate-300
													hover:bg-white/10 hover:text-white
												"
												onClick={() => setSectionTools(section.key, [])}
											>
												<X className="mr-1 h-3 w-3" />
												Clear
											</Button>

											<Button
												type="button"
												variant="ghost"
												className="
													shrink-0 cursor-pointer rounded-md border border-white/10
													bg-white/[0.045] px-2 text-[11px] text-slate-300
													hover:bg-white/10 hover:text-white
												"
												onClick={() => resetSection(section.key)}
											>
												<RotateCcw className="mr-1 h-3 w-3" />
												Reset
											</Button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
