import { capitalize } from "lodash-es";
import { LoaderCircle, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { utilityActions } from "@/services/penSidebarCodeUtils";
import type { OnshapeShortcutCommand, OnshapeToolbarMode } from "@/types";
import { executeOnshapeShortcutCommand, pressKey } from "../core/utils";
import { OnshapeIcon } from "./OnShapeIcon";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

const MotionButton = motion.create(Button);

function SidebarDivider() {
	return <div className="my-3 mx-auto h-px w-8/12 bg-border" />;
}

export function PenSidebarMainContent({
	modeTools,
	toolbarType,
	currentTool,
}: {
	currentTool: string | null;
	modeTools: OnshapeShortcutCommand[];
	toolbarType: OnshapeToolbarMode;
}) {
	return (
		<>
			<SidebarDivider />

			<div className="relative flex min-h-0 flex-1 flex-col items-center">
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={toolbarType}
						className="flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2"
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
							<LoaderCircle className="my-2 h-6 w-6 animate-spin text-muted-foreground" />
						)}

						{modeTools.map((tool, index) => (
							<Tooltip key={tool.id}>
								<TooltipTrigger asChild>
									<MotionButton
										className="h-10 w-10 shrink-0 cursor-pointer relative"
										variant={
											tool.command === currentTool ? "secondary" : "outline"
										}
										initial={{ opacity: 0, x: 12, scale: 0.92 }}
										animate={{ opacity: 1, x: 0, scale: 1 }}
										transition={{
											delay: index * 0.025,
											type: "spring",
											stiffness: 520,
											damping: 32,
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
											<div className="absolute h-2 w-2 pointer-events-none top-0 right-0 text-muted-foreground">
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
									</Card>
								</TooltipContent>
							</Tooltip>
						))}
					</motion.div>
				</AnimatePresence>
			</div>

			<SidebarDivider />

			<div className="flex flex-col items-center gap-1">
				{utilityActions.map((action) => {
					const Icon = action.icon;
					return (
						<Tooltip key={action.id}>
							<TooltipTrigger asChild>
								<Button
									className="h-10 w-10 cursor-pointer"
									variant="outline"
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
		</>
	);
}
