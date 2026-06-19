import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSettingsDialog } from "@/contexts/SettingsDialogContext";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export type RadialContextMenuItem = {
	id: string;
	label: string;
	icon: ReactNode;
	onClick: () => void;
	disabled?: boolean;
	tooltipContent: string;
};

type Position = {
	left: number;
	top: number;
};

type RadialContextMenuProps = {
	position: Position;
	items: RadialContextMenuItem[];
	className?: string;
};

const MENU_RADIUS = 62;
const ITEM_ANGLE_STEP = 44;
const CENTER_SIZE = 40;
const BUTTON_SIZE = 40;
const CLOSE_DELAY = 300;
const TOUCH_CLICK_IGNORE_MS = 500;

function getRadialLayout(index: number, count: number) {
	if (count <= 1) {
		return { x: 0, y: -MENU_RADIUS };
	}

	const totalArc = (count - 1) * ITEM_ANGLE_STEP;
	const startAngle = -90 - totalArc / 2;
	const angle = startAngle + index * ITEM_ANGLE_STEP;
	const radians = (angle * Math.PI) / 180;

	return {
		x: Math.cos(radians) * MENU_RADIUS,
		y: Math.sin(radians) * MENU_RADIUS,
	};
}

export function RadialContextMenu({
	position,
	items,
	className,
}: RadialContextMenuProps) {
	const closeTimerRef = useRef<number | null>(null);
	const lastTouchPointerDownRef = useRef(0);
	const [open, setOpen] = useState(false);

	const menuItems = useMemo(() => items, [items]);

	function cancelClose() {
		if (closeTimerRef.current === null) return;

		window.clearTimeout(closeTimerRef.current);
		closeTimerRef.current = null;
	}

	function scheduleClose() {
		cancelClose();

		closeTimerRef.current = window.setTimeout(() => {
			setOpen(false);
		}, CLOSE_DELAY);
	}

	function toggleOpen() {
		cancelClose();
		setOpen((value) => !value);
	}

	useEffect(() => {
		return () => {
			cancelClose();
		};
	}, []);

	return (
		<div
			className={[
				"os-smart-floating-actions pointer-events-none fixed z-40 select-none",
				className ?? "",
			].join(" ")}
			style={{
				left: position.left,
				top: position.top,
				transform: "translate(-50%, -50%)",
			}}
		>
			<div
				className="relative h-[240px] w-[240px] pointer-events-none"
				onPointerEnter={(event) => {
					if (event.pointerType === "mouse" || event.pointerType === "pen") {
						cancelClose();
					}
				}}
				onPointerLeave={(event) => {
					if (event.pointerType === "mouse" || event.pointerType === "pen") {
						scheduleClose();
					}
				}}
			>
				<AnimatePresence>
					{open && (
						<motion.div
							className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-2xl"
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.5 }}
							transition={{ duration: 0.22, ease: "easeOut" }}
						/>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{open &&
						menuItems.map((item, index) => {
							const { x, y } = getRadialLayout(index, menuItems.length);

							return (
								<motion.div
									key={item.id}
									className="pointer-events-auto absolute left-1/2 top-1/2"
									initial={{
										x: "-50%",
										y: "-50%",
										scale: 0.35,
										opacity: 0,
									}}
									animate={{
										x: `calc(-50% + ${x}px)`,
										y: `calc(-50% + ${y}px)`,
										scale: 1,
										opacity: 1,
									}}
									exit={{
										x: "-50%",
										y: "-50%",
										scale: 0.35,
										opacity: 0,
									}}
									transition={{
										type: "spring",
										stiffness: 520,
										damping: 28,
										mass: 0.75,
										delay: index * 0.025,
									}}
								>
									<Tooltip key={item.id} disableHoverableContent>
										<TooltipTrigger asChild>
											<Button
												type="button"
												size="icon"
												variant="ghost"
												disabled={item.disabled}
												className={[
													"os-plus-glass os-plus-glass-dark touch-none cursor-pointer",
													"grid rounded-full text-slate-100",
													"hover:bg-transparent hover:text-white",
													"active:scale-95",
													"disabled:pointer-events-none disabled:opacity-35",
												].join(" ")}
												style={{
													width: BUTTON_SIZE,
													height: BUTTON_SIZE,
												}}
												onPointerDown={(event) => {
													event.preventDefault();
													event.stopPropagation();
												}}
												onPointerUp={(event) => {
													event.preventDefault();
													event.stopPropagation();
												}}
												onClick={(event) => {
													event.preventDefault();
													event.stopPropagation();

													item.onClick();
													setOpen(false);
												}}
											>
												<motion.span
													className="grid h-full w-full place-items-center rounded-full"
													whileHover={{ scale: 1.12 }}
													whileTap={{ scale: 0.94 }}
												>
													<span className="grid h-5 w-5 place-items-center">
														{item.icon}
													</span>
												</motion.span>
											</Button>
										</TooltipTrigger>

										<TooltipContent side="right" className="z-50">
											<Card className="w-[350px]">
												<CardHeader>
													<CardTitle>{item.label}</CardTitle>
													<CardDescription>
														{item.tooltipContent}
													</CardDescription>
												</CardHeader>
											</Card>
										</TooltipContent>
									</Tooltip>
								</motion.div>
							);
						})}
				</AnimatePresence>

				<motion.div
					className="pointer-events-auto absolute left-1/2 top-1/2"
					style={{
						width: CENTER_SIZE,
						height: CENTER_SIZE,
					}}
					animate={{
						x: "-50%",
						y: "-50%",
						scale: open ? 1.05 : 1,
					}}
					transition={{
						type: "spring",
						stiffness: 500,
						damping: 30,
					}}
				>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						aria-label={open ? "Close actions" : "Open actions"}
						className={[
							"os-plus-glass os-plus-glass-dark touch-none",
							"h-full w-full rounded-full text-white",
							"hover:bg-transparent",
							"active:scale-95",
						].join(" ")}
						onPointerEnter={(event) => {
							if (
								event.pointerType === "mouse" ||
								event.pointerType === "pen"
							) {
								cancelClose();
								setOpen(true);
							}
						}}
						onPointerDown={(event) => {
							event.preventDefault();
							event.stopPropagation();

							cancelClose();

							if (event.pointerType === "touch") {
								lastTouchPointerDownRef.current = Date.now();
								toggleOpen();
							}
						}}
						onPointerUp={(event) => {
							event.preventDefault();
							event.stopPropagation();
						}}
						onClick={(event) => {
							event.preventDefault();
							event.stopPropagation();

							const justHandledTouch =
								Date.now() - lastTouchPointerDownRef.current <
								TOUCH_CLICK_IGNORE_MS;

							if (justHandledTouch) return;

							toggleOpen();
						}}
					>
						<motion.span
							animate={{
								scale: open ? 1.25 : 1,
							}}
							transition={{
								type: "spring",
								stiffness: 500,
								damping: 24,
							}}
						>
							<Zap className={["h-5 w-5", "text-blue-300"].join(" ")} />
						</motion.span>
					</Button>
				</motion.div>
			</div>
		</div>
	);
}
