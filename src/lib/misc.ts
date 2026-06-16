export function debounce<T extends (...args: any[]) => void>(
	fn: T,
	wait = 300,
) {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return (...args: Parameters<T>) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			fn(...args);
		}, wait);
	};
}
