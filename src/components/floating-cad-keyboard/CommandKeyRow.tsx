import { CadKeyboardKey } from "./CadKeyboardKey";
import { COMMAND_KEYS } from "./keyboardConstants";
import type { CadKey } from "./keyboardTypes";

type CommandKeyRowProps = {
	onKeyPress: (key: CadKey) => void;
};

export function CommandKeyRow({ onKeyPress }: CommandKeyRowProps) {
	return (
		<div className="grid grid-cols-5 gap-1.5 w-full">
			{COMMAND_KEYS.map((key) => (
				<CadKeyboardKey
					key={`${key.label}-${key.value ?? key.key}`}
					keyConfig={key}
					onPress={onKeyPress}
				/>
			))}
		</div>
	);
}
