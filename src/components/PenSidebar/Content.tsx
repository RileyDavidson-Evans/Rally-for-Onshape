import { capitalize } from "lodash-es";
import { LoaderCircle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { OnshapeIcon } from "@/components/OnShapeIcon";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettingsDialog } from "@/contexts/SettingsDialogContext";
import { executeOnshapeShortcutCommand, pressKey } from "@/core/utils";
import {
	topUtilityActions,
	topUtilityActionsExtended,
} from "@/services/penSidebarCodeUtils";
import type { OnshapeShortcutCommand, OnshapeToolbarMode } from "@/types";

const MotionButton = motion.create(Button);

function SidebarDivider() {
	return <div className="my-3 mx-auto h-px w-8/12 bg-border" />;
}

export function PenSidebarMainContent({
	modeTools,
	toolbarType,
	currentTool,
	undoEnabled,
	redoEnabled,
	featureDialogVisible,
}: {
	currentTool: string | null;
	modeTools: OnshapeShortcutCommand[];
	toolbarType: OnshapeToolbarMode;
	undoEnabled: boolean;
	redoEnabled: boolean;
	featureDialogVisible: boolean;
}) {
	const { openSettings } = useSettingsDialog();

	return (
		<>
			<SidebarDivider />

			<div className="grid grid-cols-2 justify-items-center gap-1 px-2">
				{topUtilityActions.map((action) => {
					const Icon = action.icon;
					const buttonDisabled =
						(action.label === "Undo" && !undoEnabled) ||
						(action.label === "Redo" && !redoEnabled) ||
						(action.label === "Cancel" && !featureDialogVisible) ||
						(action.label === "Confirm" && !featureDialogVisible);

					return (
						<Tooltip key={action.id}>
							<TooltipTrigger asChild>
								<Button
									className={`h-10 w-10 cursor-pointer ${action.className || ""}`}
									variant="secondary"
									size="icon"
									disabled={buttonDisabled}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										action.onClick();
									}}
								>
									<Icon className="h-5 w-5" />
								</Button>
							</TooltipTrigger>

							<TooltipContent side="right">
								<Card className="w-[260px]">
									<CardHeader>
										<CardTitle>{action.label}</CardTitle>
										<CardDescription>{action.description}</CardDescription>
									</CardHeader>
								</Card>
							</TooltipContent>
						</Tooltip>
					);
				})}
			</div>

			<SidebarDivider />

			<div className="grid grid-cols-2 justify-items-center gap-1 px-2">
				{topUtilityActionsExtended.map((action) => {
					const Icon = action.icon;

					return (
						<Tooltip key={action.id}>
							<TooltipTrigger asChild>
								<Button
									className={`h-10 w-10 cursor-pointer ${action.className || ""}`}
									variant="secondary"
									size="icon"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										action.onClick();
									}}
								>
									<Icon className="h-5 w-5" />
								</Button>
							</TooltipTrigger>

							<TooltipContent side="right">
								<Card className="w-[260px]">
									<CardHeader>
										<CardTitle>{action.label}</CardTitle>
										<CardDescription>{action.description}</CardDescription>
									</CardHeader>
								</Card>
							</TooltipContent>
						</Tooltip>
					);
				})}
			</div>

			<SidebarDivider />

			<div className="relative flex min-h-0 flex-1 flex-col items-center">
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={toolbarType}
						className="grid min-h-0 w-full flex-1 grid-cols-2 content-start justify-items-center gap-1 overflow-y-auto px-2"
						initial={{ x: 28, opacity: 0, filter: "blur(4px)" }}
						animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
						exit={{ x: -28, opacity: 0, filter: "blur(4px)" }}
						transition={{
							type: "spring",
							stiffness: 420,
							damping: 36,
							mass: 0.8,
						}}
					>
						{modeTools.length === 0 && (
							<LoaderCircle className="col-span-2 my-2 h-6 w-6 animate-spin text-muted-foreground" />
						)}

						{modeTools.map((tool, index) => (
							<Tooltip key={tool.id} disableHoverableContent={false}>
								<TooltipTrigger asChild>
									<MotionButton
										className={`relative h-10 w-10 shrink-0 cursor-pointer ${tool.command === currentTool ? "bg-slate-800 border border-slate-700" : ""}`}
										variant={"secondary"}
										size="icon"
										initial={{ opacity: 0, x: 3 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{
											delay: index * 0.025,
											type: "spring",
										}}
										whileTap={{ scale: 0.94 }}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();

											if (tool.command === currentTool) {
												pressKey("Escape", {
													code: "Escape",
													keyCode: 27,
													which: 27,
												});
												return;
											}

											executeOnshapeShortcutCommand(tool);
										}}
									>
										<OnshapeIcon icon={tool.icon!} />

										{tool.command === currentTool && (
											<div className="pointer-events-none absolute right-0 top-0 h-2 w-2 text-muted-foreground">
												<XCircle />
											</div>
										)}
									</MotionButton>
								</TooltipTrigger>

								<TooltipContent side="right">
									<Card className="w-[350px]">
										<CardHeader>
											<CardTitle>{capitalize(tool.command)}</CardTitle>
											<CardDescription>
												{capitalize(
													tool.expandedTooltipKey?.replace("tooltips:::", ""),
												)}
											</CardDescription>
										</CardHeader>
										<CardFooter>
											<Button
												onClick={openSettings}
												variant={"link"}
												className="cursor-pointer"
											>
												Customize your quick actions
											</Button>
										</CardFooter>
									</Card>
								</TooltipContent>
							</Tooltip>
						))}
					</motion.div>
				</AnimatePresence>
			</div>
		</>
	);
}
