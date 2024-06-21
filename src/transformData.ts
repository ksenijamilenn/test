interface Item {
	fileUrl: string;
}

interface TransformedData {
	[key: string]: any[];
}

export const transformData = (items: Item[]): TransformedData => {
	const result: TransformedData = {};

	items.forEach((item) => {
		const url = new URL(item.fileUrl);
		const ip = url.hostname;
		const pathSegments = url.pathname.split('/');

		if (!result[ip]) {
			result[ip] = [];
		}

		let currentLevel = result[ip];

		pathSegments.forEach((segment, index) => {
			if (segment === '') {
				return;
			}

			const isLastSegment = index === pathSegments.length - 1;
			const isDirectory =
				!isLastSegment && pathSegments[index + 1] === '';

			if (isLastSegment && !isDirectory) {
				if (!currentLevel.includes(segment)) {
					currentLevel.push(segment);
				}
			} else {
				let existingDir = currentLevel.find(
					(dir: any) =>
						typeof dir === 'object' && dir.hasOwnProperty(segment)
				);

				if (!existingDir) {
					existingDir = { [segment]: [] };
					currentLevel.push(existingDir);
				} else if (typeof existingDir === 'string') {
					existingDir = { [segment]: [] };
					currentLevel[currentLevel.indexOf(segment)] = existingDir;
				}

				currentLevel = existingDir[segment];
			}
		});
	});

	return result;
};
