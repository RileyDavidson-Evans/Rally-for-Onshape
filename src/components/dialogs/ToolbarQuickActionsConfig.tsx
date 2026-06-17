import { RotateCcw, Settings, Wrench, X } from "lucide-react";
import { useState } from "react";
import { CommandMultiSelect } from "@/components/shared/CommandMultiSelect";
import { Button } from "@/components/ui/button";
import { useExtensionSettings } from "@/contexts/ExtensionSettingsContext";
import { cn } from "@/lib/utils";
import { DEFAULT_STORAGE_VALUES } from "@/storage/extensionStorage";
import type { OnshapeToolbarMode } from "@/types";
import { ONSHAPE_TOOLBAR_MODES } from "@/types";

export type ToolbarQuickActionOption = {
	id: string;
	label: string;
	description?: string;
};

type ToolbarQuickActionsCustomizerProps = {
	availableToolsByMode: Record<OnshapeToolbarMode, ToolbarQuickActionOption[]>;
};

export function ToolbarQuickActionsConfig({
	availableToolsByMode,
}: ToolbarQuickActionsCustomizerProps) {
	const { settings, updateSetting } = useExtensionSettings();
	const [isExpanded, setIsExpanded] = useState(false);

	const setModeActions = async (
		mode: OnshapeToolbarMode,
		actionIds: string[],
	) => {
		await updateSetting("toolbarQuickActions", (config) => ({
			...config,
			[mode]: actionIds,
		}));
	};

	const resetMode = async (mode: OnshapeToolbarMode) => {
		await updateSetting("toolbarQuickActions", (config) => ({
			...config,
			[mode]: DEFAULT_STORAGE_VALUES.toolbarQuickActions[mode],
		}));
	};

	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.035]">
			<button
				type="button"
				className="
					flex w-full items-center gap-3 p-3 text-left
					transition-colors hover:bg-white/[0.04]
				"
			>
				<div
					className="
						flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
						border border-white/10 bg-white/[0.06] text-blue-300
					"
				>
					<Wrench className="h-5 w-5" />
				</div>

				<div className="min-w-0 flex-1">
					<div className="text-sm font-medium text-slate-100">
						Toolbar Actions
					</div>

					<div className="mt-1 text-xs leading-snug text-slate-300">
						Choose which quick actions appear in each Onshape workspace mode.
					</div>
				</div>

				<Button
					size="icon"
					variant="ghost"
					className="cursor-pointer"
					onClick={(event) => {
						event.stopPropagation();
						setIsExpanded((current) => !current);
					}}
				>
					<Settings
						className={cn(
							"h-5 w-5 shrink-0 text-slate-200 transition-transform",
						)}
					/>
				</Button>
			</button>

			{isExpanded && (
				<div className="border-t border-white/10 p-3 pt-2">
					<div className="flex flex-col gap-3">
						{ONSHAPE_TOOLBAR_MODES.map((mode) => {
							const selectedActionIds =
								settings.toolbarQuickActions[mode] ?? [];
							const availableTools = availableToolsByMode[mode] ?? [];

							return (
								<div
									key={mode}
									className="rounded-lg border border-white/10 bg-black/15 p-3"
								>
									<div className="flex items-center justify-between gap-3">
										<div className="min-w-0">
											<div className="font-medium text-slate-100">{mode}</div>
										</div>

										<div className="flex items-center gap-3">
											<CommandMultiSelect
												value={selectedActionIds}
												options={availableTools}
												onChange={(actionIds) =>
													setModeActions(mode, actionIds)
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
												onClick={() => setModeActions(mode, [])}
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
												onClick={() => resetMode(mode)}
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
