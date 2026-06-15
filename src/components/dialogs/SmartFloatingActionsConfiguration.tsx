import {
	Check,
	ChevronDown,
	ChevronsUpDown,
	RotateCcw,
	Settings,
	X,
	Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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

function getSelectedSummary(
	value: string[],
	toolsById: Record<string, SmartActionToolOption | undefined>,
) {
	if (value.length === 0) {
		return "No actions selected";
	}

	if (value.length <= 2) {
		return value.map((toolId) => toolsById[toolId]?.label ?? toolId).join(", ");
	}

	return `${value.length} actions selected`;
}

type SmartActionToolMultiSelectProps = {
	value: string[];
	options: SmartActionToolOption[];
	placeholder?: string;
	onChange: (value: string[]) => void;
};

function SmartActionToolMultiSelect({
	value,
	options,
	placeholder = "Select actions",
	onChange,
}: SmartActionToolMultiSelectProps) {
	const [open, setOpen] = useState(false);

	const toolsById = useMemo(
		() =>
			Object.fromEntries(options.map((tool) => [tool.id, tool])) as Record<
				string,
				SmartActionToolOption | undefined
			>,
		[options],
	);

	const selectedSummary = getSelectedSummary(value, toolsById);

	const toggleValue = (toolId: string) => {
		if (value.includes(toolId)) {
			onChange(value.filter((id) => id !== toolId));
			return;
		}

		onChange([...value, toolId]);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					role="combobox"
					aria-expanded={open}
					className="
						w-[150px] justify-between rounded-lg border border-white/10
						bg-white/[0.045] px-3 text-left text-xs font-medium text-slate-200
						hover:bg-white/10 hover:text-white
					"
				>
					<span className="min-w-0 truncate">
						{selectedSummary || placeholder}
					</span>

					<ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 text-slate-400" />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align="start"
				className="
		w-96 border-white/10
		bg-slate-950/95 p-0 text-white shadow-2xl backdrop-blur-xl
	"
			>
				<Command className="bg-transparent">
					<CommandInput
						placeholder="Search actions..."
						className="h-9 text-xs"
					/>

					<CommandList className="max-h-[220px] overflow-y-auto overscroll-contain">
						<CommandEmpty>No actions found.</CommandEmpty>

						<CommandGroup>
							{options.map((tool) => {
								const isSelected = value.includes(tool.id);

								return (
									<CommandItem
										key={tool.id}
										value={`${tool.label} ${tool.id}`}
										className="
								cursor-pointer text-xs text-slate-200
								aria-selected:bg-white/10 aria-selected:text-white
							"
										onSelect={() => toggleValue(tool.id)}
									>
										<div
											className={cn(
												"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-white/15",
												isSelected
													? "bg-blue-500/25 text-blue-100"
													: "text-transparent",
											)}
										>
											<Check className="h-3 w-3" />
										</div>

										<div className="min-w-0 flex-1">
											<div className="truncate">{tool.label}</div>

											{tool.description && (
												<div className="truncate text-[11px] text-slate-400">
													{tool.description}
												</div>
											)}
										</div>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

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
					flex w-full cursor-pointer items-center gap-3 p-3 text-left
					transition-colors hover:bg-white/[0.04]
				"
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
						Customize Smart Actions
					</div>

					<div className="mt-1 text-xs leading-snug text-slate-300">
						Choose which actions appear for faces and edges.
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Switch
						checked={settings.smartActionsEnabled}
						onCheckedChange={(v) => setSetting("smartActionsEnabled", v)}
					/>
					<Settings
						className={cn(
							"h-4 w-4 shrink-0 text-slate-400 transition-transform",
							isExpanded && "rotate-180",
						)}
						onClick={() => setIsExpanded(!isExpanded)}
					/>
				</div>
			</button>

			{isExpanded && (
				<div className="border-t border-white/10 p-3 pt-2">
					<div className="flex flex-col gap-3">
						{SMART_ACTION_SECTIONS.map((section) => {
							const selectedToolIds = settings.radialMenuConfig[section.key];

							return (
								<div
									key={section.key}
									className="rounded-lg border border-white/10 bg-black/15 p-3"
								>
									<div className="mb-2 flex items-start justify-between gap-3">
										<div className="min-w-0">
											<div className="text-xs font-medium text-slate-100">
												{section.label}
											</div>
										</div>
										<div className="flex items-center gap-3">
											<SmartActionToolMultiSelect
												value={selectedToolIds}
												options={availableTools}
												onChange={(toolIds) =>
													setSectionTools(section.key, toolIds)
												}
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
