import {
	ChevronDown,
	ChevronUp,
	Fullscreen,
	GripHorizontal,
	Settings,
	Shrink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSettingsDialog } from "@/contexts/SettingsDialogContext";
import { toggleFullscreen } from "@/core/utils";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function FixedItems({
	collapsed,
	setCollapsed,
	setOnshapeSideBarWidth,
}: {
	collapsed: boolean;
	setCollapsed: (v: boolean) => void;
	setOnshapeSideBarWidth: () => void;
}) {
	const { openSettings } = useSettingsDialog();
	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		function onFullScreenChange() {
			const documentIsFullscreen = !!document.fullscreenElement;
			setIsFullscreen(documentIsFullscreen);
			setOnshapeSideBarWidth();

			document.body.classList[documentIsFullscreen ? "add" : "remove"](
				"onshape-plus-fullscreen-mode",
			);
		}

		document.addEventListener("fullscreenchange", onFullScreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", onFullScreenChange);
		};
	}, []);

	return (
		<div
			className={`grid grid-cols-2 justify-items-center gap-1 px-2 ${
				collapsed ? "pb-2" : ""
			}`}
		>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="secondary"
						size="icon"
						className="os-pen-drag-handle h-10 w-10 shrink-0 cursor-pointer active:cursor-grabbing"
					>
						<GripHorizontal />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="left">
					<Card className="w-[350px]">
						<CardHeader>
							<CardTitle>Move</CardTitle>
							<CardDescription>
								Click and drag to change the position of this sidebar.
							</CardDescription>
						</CardHeader>
					</Card>
				</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="secondary"
						size="icon"
						className="h-10 w-10 cursor-pointer"
						onClick={openSettings}
					>
						<Settings className="h-5 w-5" />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="right">
					<Card className="w-[350px]">
						<CardHeader>
							<CardTitle>Configuration</CardTitle>
							<CardDescription>
								Change the way Rally for Onshape works to best suit your
								workflow. View links for the Github, Discord and more.
							</CardDescription>
						</CardHeader>
					</Card>
				</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="secondary"
						size="icon"
						className="h-10 w-10 shrink-0 cursor-pointer"
						onClick={toggleFullscreen}
					>
						{isFullscreen ? <Shrink /> : <Fullscreen />}
					</Button>
				</TooltipTrigger>

				<TooltipContent side="left">
					<Card className="w-[350px]">
						<CardHeader>
							<CardTitle>Toggle Fullscreen</CardTitle>
							<CardDescription>
								Toggles the fullscreen onshape experience, give it a try to
								experience onshape like a native app!
							</CardDescription>
						</CardHeader>
					</Card>
				</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="secondary"
						size="icon"
						className="h-10 w-10 shrink-0 cursor-pointer"
						onClick={() => setCollapsed(!collapsed)}
					>
						{collapsed ? <ChevronDown /> : <ChevronUp />}
					</Button>
				</TooltipTrigger>

				<TooltipContent side="right">
					<Card className="w-[350px]">
						<CardHeader>
							<CardTitle>Collapse</CardTitle>
							<CardDescription>
								Hide / Show the sidebar content.
							</CardDescription>
						</CardHeader>
					</Card>
				</TooltipContent>
			</Tooltip>
		</div>
	);
}
