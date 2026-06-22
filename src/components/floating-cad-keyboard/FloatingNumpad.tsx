import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useSettingsDialog } from "@/contexts/SettingsDialogContext";
import { CadKeyboardHeader } from "./CadKeyboardHeader";
import { CadKeyboardTabs } from "./CadKeyboardTabs";
import { CommandKeyRow } from "./CommandKeyRow";
import { useFloatingCadKeyboard } from "./useFloatingCadKeyboard";

type DragPosition = {
	x: number;
	y: number;
};

export function FloatingNumpad() {
	const nodeRef = useRef<HTMLDivElement>(null);
	const { openSettings } = useSettingsDialog();

	const {
		hideKeyboard,
		isShift,
		isVisible,
		keyboardRef,
		mode,
		position,
		sendCadKey,
		setIsShift,
		setMode,
		textKeys,
	} = useFloatingCadKeyboard();

	if (!isVisible) return null;

	return (
		<Card
			ref={(node) => {
				nodeRef.current = node;
				keyboardRef.current = node;
			}}
			id="os-floating-cad-keyboard"
			tabIndex={-1}
			className={[
				"os-glass-bg-shadow",
				"fixed! left-0 top-0 z-[1050] w-[300px]",
				mode === "text" && "w-[350px]",
				"transition-[width] duration-500",
				"os-animate-in",
			].join(" ")}
			style={{
				top: position.top,
				left: position.left,
			}}
		>
			<CardHeader className="os-cad-keyboard-drag-handle cursor-grab touch-none select-none active:cursor-grabbing">
				<CardTitle />
				<CadKeyboardHeader
					onClose={hideKeyboard}
					onOpenSettings={openSettings}
				/>
			</CardHeader>

			<CardContent>
				<CadKeyboardTabs
					isShift={isShift}
					mode={mode}
					onKeyPress={sendCadKey}
					onModeChange={setMode}
					onShiftChange={setIsShift}
					textKeys={textKeys}
				/>
			</CardContent>

			<CardFooter>
				<CommandKeyRow onKeyPress={sendCadKey} />
			</CardFooter>
		</Card>
	);
}
