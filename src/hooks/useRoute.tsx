import { useEffect, useState } from "react";
import { getRoute, subscribeToRoute, type OnshapeRoute } from "@/core/utils";

export function useOnshapeRoute(): OnshapeRoute {
	const [route, setRoute] = useState<OnshapeRoute>(() => getRoute());

	useEffect(() => {
		return subscribeToRoute(setRoute);
	}, []);

	return route;
}