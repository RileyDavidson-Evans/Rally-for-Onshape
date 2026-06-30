// CanvasBackgroundCustomizer.tsx

import { ImageIcon, Settings2 } from "lucide-react";
import { Button } from "../ui/button";
import { CanvasBackgroundDialog } from "./CanvasBackgroundDialog";

export function CanvasBackgroundCustomizer() {
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
					group-hover:bg-primary/15
				"
			>
				<ImageIcon className="h-5 w-5" />
			</div>

			<div className="min-w-0">
				<div className="text-sm font-medium text-card-foreground">
					Canvas Background
				</div>
				<div className="mt-0.5 text-xs leading-snug text-muted-foreground">
					Personalize your Onshape canvas with a preset or custom image.
				</div>
			</div>

			<div className="ml-auto">
				<CanvasBackgroundDialog>
					<Button size="sm" variant="secondary" className="gap-2">
						<Settings2 className="h-4 w-4" />
						Configure
					</Button>
				</CanvasBackgroundDialog>
			</div>
		</div>
	);
}
