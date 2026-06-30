import { Palette } from "lucide-react";
import { useExtensionSettings } from "@/contexts/ExtensionSettingsContext";
import type { Theme } from "@/storage/extensionStorage";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

export function ThemeCustomizer() {
	const { settings, setSetting } = useExtensionSettings();
	const onThemeChangeHandler = (v: Theme) => {
		setSetting("theme", v);
	};

	return (
		<div
			className="
												group flex w-full items-center gap-3 rounded-xl
												border border-border bg-muted/35 p-3 text-left
												shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]
												transition-all duration-150
												hover:border-primary/25 hover:bg-accent
											"
		>
			<div
				className="
													flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
													border border-border bg-background/60 text-primary
													group-hover:bg-primary/15 group-hover:text-primary
												"
			>
				<Palette className="h-5 w-5" />
			</div>

			<div className="min-w-0">
				<div className="text-sm font-medium text-card-foreground">Theme</div>

				<div className="mt-0.5 text-xs leading-snug text-muted-foreground">
					Choose your Rally for Onshape theme.
				</div>
			</div>
			<div className="flex-1 flex justify-end">
				<Select
					defaultValue={settings.theme}
					onValueChange={onThemeChangeHandler}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="light">Light</SelectItem>
							<SelectItem value="dark">Dark</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
