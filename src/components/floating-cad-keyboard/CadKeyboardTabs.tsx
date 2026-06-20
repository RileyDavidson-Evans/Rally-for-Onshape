import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CadKeyboardKey } from "./CadKeyboardKey";
import {
	FUNCTION_KEYS,
	NUMBER_KEYS,
	SYMBOL_KEYS,
	TEXT_SYMBOL_KEYS,
	UNIT_KEYS,
} from "./keyboardConstants";
import type { CadKey, KeyboardMode } from "./keyboardTypes";

type CadKeyboardTabsProps = {
	isShift: boolean;
	mode: KeyboardMode;
	textKeys: CadKey[][];
	onBeforeKeyPress: () => void;
	onKeyPress: (key: CadKey) => void;
	onModeChange: (mode: KeyboardMode) => void;
	onShiftChange: (updater: (value: boolean) => boolean) => void;
};

export function CadKeyboardTabs({
	isShift,
	mode,
	onBeforeKeyPress,
	onKeyPress,
	onModeChange,
	onShiftChange,
	textKeys,
}: CadKeyboardTabsProps) {
	const renderKey = (key: CadKey) => (
		<CadKeyboardKey
			key={`${key.label}-${key.value ?? key.key}`}
			keyConfig={key}
			onBeforePress={onBeforeKeyPress}
			onPress={onKeyPress}
		/>
	);

	return (
		<Tabs
			value={mode}
			onValueChange={(value) => onModeChange(value as KeyboardMode)}
		>
			<TabsList className="w-full">
				<TabsTrigger
					value="numbers"
					className="cursor-pointer"
					onPointerDown={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onModeChange("numbers");
					}}
				>
					Numbers
				</TabsTrigger>
				<TabsTrigger
					value="text"
					className="cursor-pointer"
					onPointerDown={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onModeChange("text");
					}}
				>
					Text
				</TabsTrigger>
				<TabsTrigger
					value="symbols"
					className="cursor-pointer"
					onPointerDown={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onModeChange("symbols");
					}}
				>
					Symbols
				</TabsTrigger>
			</TabsList>

			<TabsContent value="numbers">
				<div className="mb-2 grid grid-cols-6 gap-1.5">
					{UNIT_KEYS.map(renderKey)}
				</div>
				<div className="mb-2 grid grid-cols-4 gap-1.5">
					{FUNCTION_KEYS.map(renderKey)}
				</div>
				<div className="grid grid-cols-4 gap-1.5">
					{NUMBER_KEYS.map(renderKey)}
				</div>
			</TabsContent>

			<TabsContent value="text">
				<div className="space-y-1.5">
					{textKeys.map((row, rowIndex) => (
						<div
							key={`text-row-${rowIndex}`}
							className={[
								"grid gap-1.5",
								rowIndex === 0 ? "grid-cols-10" : "",
								rowIndex === 1 ? "grid-cols-9 px-4" : "",
								rowIndex === 2 ? "grid-cols-7 px-8" : "",
							].join(" ")}
						>
							{row.map(renderKey)}
						</div>
					))}

					<div className="grid grid-cols-5 gap-1.5">
						<Button
							className={[
								"!h-10 cursor-pointer rounded-md border text-sm font-semibold",
								isShift
									? "border-blue-400/30 bg-blue-500/20 text-blue-100"
									: "border-white/10 bg-white/[0.075] text-slate-200",
							].join(" ")}
							variant="ghost"
							tabIndex={-1}
							type="button"
							onPointerDown={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onShiftChange((value) => !value);
							}}
						>
							Shift
						</Button>

						{TEXT_SYMBOL_KEYS.map(renderKey)}
					</div>
				</div>
			</TabsContent>

			<TabsContent value="symbols">
				<div className="grid grid-cols-4 gap-1.5">
					{SYMBOL_KEYS.map(renderKey)}
					{FUNCTION_KEYS.map(renderKey)}
				</div>
			</TabsContent>
		</Tabs>
	);
}
