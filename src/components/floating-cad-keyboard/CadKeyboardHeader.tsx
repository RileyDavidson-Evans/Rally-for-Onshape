import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACTION_DELAY } from "./keyboardTypes";

type CadKeyboardHeaderProps = {
	onOpenSettings: () => void;
	onClose: () => void;
	onBeforeAction: () => void;
};

export function CadKeyboardHeader({
	onBeforeAction,
	onClose,
	onOpenSettings,
}: CadKeyboardHeaderProps) {
	return (
		<div className="flex items-center justify-between px-1 pb-2">
			<div className="flex items-center gap-2">
				<div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]" />

				<span className="text-xs font-semibold tracking-[0.18em] text-slate-400">
					CAD KEYBOARD
				</span>
			</div>

			<div className="flex gap-1">
				<Button
					className="h-7 w-7 cursor-pointer"
					variant="ghost"
					size="icon"
					type="button"
					tabIndex={-1}
					onPointerDown={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onOpenSettings();
					}}
				>
					<Settings />
				</Button>

				<Button
					className="h-7 w-7 cursor-pointer rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
					variant="ghost"
					size="icon"
					type="button"
					tabIndex={-1}
					onPointerDown={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onBeforeAction();

						window.setTimeout(() => {
							onClose();
						}, ACTION_DELAY);
					}}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
