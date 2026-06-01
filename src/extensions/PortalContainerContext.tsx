// src/extension/PortalContainerContext.tsx
import { createContext, useContext } from "react";

const PortalContainerContext = createContext<HTMLElement | null>(null);

export function PortalContainerProvider({
	container,
	children,
}: {
	container: HTMLElement;
	children: React.ReactNode;
}) {
	return (
		<PortalContainerContext.Provider value={container}>
			{children}
		</PortalContainerContext.Provider>
	);
}

export function usePortalContainer() {
	return useContext(PortalContainerContext);
}
