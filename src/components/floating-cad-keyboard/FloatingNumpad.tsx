import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSettingsDialog } from "@/contexts/SettingsDialogContext";
import { CadKeyboardHeader } from "./CadKeyboardHeader";
import { CadKeyboardTabs } from "./CadKeyboardTabs";
import { CommandKeyRow } from "./CommandKeyRow";
import { useFloatingCadKeyboard } from "./useFloatingCadKeyboard";

export function FloatingNumpad() {
	const { openSettings } = useSettingsDialog();
	const {
		cancelPendingHide,
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
			ref={keyboardRef}
			id="os-floating-cad-keyboard"
			tabIndex={-1}
			className={[
				"os-glass-bg-shadow",
				"fixed! w-[300px] z-[1050]",
				mode === "text" && "w-[350px]",
				"transition-all duration-500",
			].join(" ")}
			style={{
				left: `${position.left}px`,
				top: `${position.top}px`,
			}}
			onPointerDown={(e) => {
				e.preventDefault();
				e.stopPropagation();
				cancelPendingHide();
			}}
		>
			<CardHeader>
				<CardTitle></CardTitle>
				<CadKeyboardHeader
					onBeforeAction={cancelPendingHide}
					onClose={hideKeyboard}
					onOpenSettings={openSettings}
				/>
			</CardHeader>

			<CardContent>
				<CadKeyboardTabs
					isShift={isShift}
					mode={mode}
					onBeforeKeyPress={cancelPendingHide}
					onKeyPress={sendCadKey}
					onModeChange={setMode}
					onShiftChange={setIsShift}
					textKeys={textKeys}
				/>
			</CardContent>
			<CardFooter>
				<CommandKeyRow
					onBeforeKeyPress={cancelPendingHide}
					onKeyPress={sendCadKey}
				/>
			</CardFooter>
		</Card>
	);
}
