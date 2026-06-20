import { Card } from "@/components/ui/card";
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
				"fixed z-50 w-[230px] select-none overflow-hidden rounded-2xl",
				mode === "text" && "w-[350px]",
				"transition-all duration-500 ease-in-out",
				"border border-white/10",
				"os-plus-glass",
				"p-2 backdrop-blur-xl",
				"before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]",
				"before:bg-gradient-to-b before:from-white/5 before:via-white/[0.015] before:to-transparent",
				"after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/5",
				isVisible
					? "pointer-events-auto scale-100 opacity-100"
					: "pointer-events-none scale-95 opacity-0",
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
			<div className="relative z-10">
				<CadKeyboardHeader
					onBeforeAction={cancelPendingHide}
					onClose={hideKeyboard}
					onOpenSettings={openSettings}
				/>

				<Separator className="mb-2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				<CadKeyboardTabs
					isShift={isShift}
					mode={mode}
					onBeforeKeyPress={cancelPendingHide}
					onKeyPress={sendCadKey}
					onModeChange={setMode}
					onShiftChange={setIsShift}
					textKeys={textKeys}
				/>

				<Separator className="my-2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				<CommandKeyRow
					onBeforeKeyPress={cancelPendingHide}
					onKeyPress={sendCadKey}
				/>
			</div>
		</Card>
	);
}
