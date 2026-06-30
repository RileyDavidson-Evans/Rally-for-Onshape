import { ChevronDown, RotateCcw, X, Zap } from "lucide-react";
import { type ReactNode, useState } from "react";
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
	iconComponent?: ReactNode;
};

type SmartActionsCustomizerProps = {
	availableTools: SmartActionToolOption[];
};

const SMART_ACTION_SECTIONS: {
	key: keyof RadialMenuConfig;
	label: string;
}[] = [
	{
		key: "singleFace",
		label: "Single Face",
	},
	{
		key: "singleEdge",
		label: "Single Edge",
	},
	{
		key: "multipleFaces",
		label: "Multiple Faces",
	},
	{
		key: "multipleEdges",
		label: "Multiple Edges",
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
		<div className="rounded-xl border border-border bg-muted/35">
			<button
				type="button"
				className="
					flex w-full cursor-pointer items-center gap-3 p-3 text-left
					transition-colors hover:bg-accent
				"
				onClick={(event) => {
					event.stopPropagation();
					setIsExpanded((current) => !current);
				}}
			>
				<div
					className="
						flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
						border border-border bg-background/60 text-primary
					"
				>
					<Zap className="h-5 w-5" />
				</div>

				<div className="min-w-0 flex-1">
					<div className="text-sm font-medium text-card-foreground">
						Quick Actions
					</div>

					<div className="mt-1 text-xs leading-snug text-muted-foreground">
						Choose which actions appear when selecting faces and edges in Part
						Studio.
					</div>
				</div>

				<Button
					size="icon"
					variant="ghost"
					className="shrink-0 cursor-pointer text-muted-foreground hover:bg-background/60 hover:text-foreground"
					type="button"
					tabIndex={-1}
				>
					<ChevronDown
						className={cn(
							"h-5 w-5 shrink-0 transition-transform",
							isExpanded && "rotate-180",
						)}
					/>
				</Button>
			</button>

			{isExpanded && (
				<div className="border-t border-border p-3 pt-2">
					<div className="flex flex-col gap-3">
						<div className="rounded-lg border border-border bg-background/45 p-3">
							<div className="flex items-center justify-between gap-3">
								<div className="min-w-0">
									<div className="font-medium text-card-foreground">
										Enabled
									</div>
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
									className="rounded-lg border border-border bg-background/45 p-3"
								>
									<div className="flex items-center justify-between gap-3">
										<div className="min-w-0">
											<div className="font-medium text-card-foreground">
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
													shrink-0 cursor-pointer rounded-md border border-border
													bg-background/50 px-2 text-[11px] text-muted-foreground
													hover:bg-accent hover:text-accent-foreground
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
													shrink-0 cursor-pointer rounded-md border border-border
													bg-background/50 px-2 text-[11px] text-muted-foreground
													hover:bg-accent hover:text-accent-foreground
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
