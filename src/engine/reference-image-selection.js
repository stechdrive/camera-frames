function degToRad(value) {
	return (Number(value) * Math.PI) / 180;
}

export function rotatePointAroundPivot(point, pivot, angleRad) {
	const deltaX = point.x - pivot.x;
	const deltaY = point.y - pivot.y;
	const cosine = Math.cos(angleRad);
	const sine = Math.sin(angleRad);
	return {
		x: pivot.x + deltaX * cosine - deltaY * sine,
		y: pivot.y + deltaX * sine + deltaY * cosine,
	};
}

export function getRectCornersFromAnchor({
	left,
	top,
	width,
	height,
	anchorAx = 0.5,
	anchorAy = 0.5,
	rotationDeg = 0,
}) {
	const pivot = {
		x: left + width * anchorAx,
		y: top + height * anchorAy,
	};
	const angleRad = degToRad(rotationDeg);
	const points = [
		{ x: left, y: top },
		{ x: left + width, y: top },
		{ x: left + width, y: top + height },
		{ x: left, y: top + height },
	];
	if (Math.abs(angleRad) < 1e-9) {
		return points;
	}
	return points.map((point) => rotatePointAroundPivot(point, pivot, angleRad));
}

export function getRectPivotFromAnchor({
	left,
	top,
	width,
	height,
	anchorAx = 0.5,
	anchorAy = 0.5,
}) {
	return {
		x: left + width * anchorAx,
		y: top + height * anchorAy,
	};
}

export function getPointFromRectLocal({
	left,
	top,
	width,
	height,
	localX,
	localY,
	anchorAx = 0.5,
	anchorAy = 0.5,
	rotationDeg = 0,
}) {
	const pivot = getRectPivotFromAnchor({
		left,
		top,
		width,
		height,
		anchorAx,
		anchorAy,
	});
	const point = {
		x: left + width * localX,
		y: top + height * localY,
	};
	const angleRad = degToRad(rotationDeg);
	if (Math.abs(angleRad) < 1e-9) {
		return point;
	}
	return rotatePointAroundPivot(point, pivot, angleRad);
}

export function getPointsBounds(points) {
	if (!Array.isArray(points) || points.length === 0) {
		return null;
	}
	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;
	for (const point of points) {
		minX = Math.min(minX, point.x);
		minY = Math.min(minY, point.y);
		maxX = Math.max(maxX, point.x);
		maxY = Math.max(maxY, point.y);
	}
	return {
		left: minX,
		top: minY,
		right: maxX,
		bottom: maxY,
		width: maxX - minX,
		height: maxY - minY,
		centerX: (minX + maxX) * 0.5,
		centerY: (minY + maxY) * 0.5,
	};
}

export function getReferenceImageLayerScreenCorners(layer) {
	return getRectCornersFromAnchor({
		left: Number(layer?.leftPx ?? 0),
		top: Number(layer?.topPx ?? 0),
		width: Number(layer?.widthPx ?? 0),
		height: Number(layer?.heightPx ?? 0),
		anchorAx: Number(layer?.anchorAx ?? 0.5),
		anchorAy: Number(layer?.anchorAy ?? 0.5),
		rotationDeg: Number(layer?.rotationDeg ?? 0),
	});
}

export function getReferenceImageLayerScreenBounds(layer) {
	return getPointsBounds(getReferenceImageLayerScreenCorners(layer));
}

export function getReferenceImageSelectionScreenBounds(layers) {
	const allPoints = [];
	for (const layer of layers ?? []) {
		allPoints.push(...getReferenceImageLayerScreenCorners(layer));
	}
	return getPointsBounds(allPoints);
}

export function normalizeAngleDeltaDeg(value) {
	let angle = Number(value) || 0;
	while (angle > 180) {
		angle -= 360;
	}
	while (angle < -180) {
		angle += 360;
	}
	return angle;
}
