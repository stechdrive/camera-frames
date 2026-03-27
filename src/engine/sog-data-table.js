import { PlyReader, SpzReader } from "@sparkjsdev/spark";

const BASE_SOG_COLUMN_NAMES = [
	"x",
	"y",
	"z",
	"scale_0",
	"scale_1",
	"scale_2",
	"f_dc_0",
	"f_dc_1",
	"f_dc_2",
	"opacity",
	"rot_0",
	"rot_1",
	"rot_2",
	"rot_3",
];

const SH_COEFFICIENTS_BY_BAND = [0, 3, 8, 15];
const SH_C0 = 0.28209479177387814;

function getPathExtension(value) {
	const clean = String(value ?? "")
		.trim()
		.replace(/\\/g, "/")
		.split("?")[0]
		.split("#")[0]
		.toLowerCase();
	const lastDot = clean.lastIndexOf(".");
	return lastDot >= 0 ? clean.slice(lastDot + 1) : "";
}

export function normalizeMaxShBands(value, fallback = 2) {
	const nextValue = Number(value);
	if (!Number.isFinite(nextValue)) {
		return fallback;
	}
	return Math.max(0, Math.min(3, Math.trunc(nextValue)));
}

export function getSogColumnNames(maxShBands = 2) {
	const normalizedBands = normalizeMaxShBands(maxShBands);
	const shCoefficientCount = SH_COEFFICIENTS_BY_BAND[normalizedBands];
	const shColumnNames = Array.from(
		{ length: shCoefficientCount * 3 },
		(_, index) => `f_rest_${index}`,
	);
	return [...BASE_SOG_COLUMN_NAMES, ...shColumnNames];
}

function createSerializedSogColumns(numRows, maxShBands = 2) {
	const columnNames = getSogColumnNames(maxShBands);
	const columnData = columnNames.map(() => new Float32Array(numRows));
	return {
		numRows,
		maxShBands: normalizeMaxShBands(maxShBands),
		columnNames,
		columnData,
	};
}

function getColumnLookup(serializedColumns) {
	return Object.fromEntries(
		serializedColumns.columnNames.map((name, index) => [
			name,
			serializedColumns.columnData[index],
		]),
	);
}

function toLogScale(value) {
	return Math.log(Math.max(Number(value ?? 0), 1e-8));
}

function toLogit(value) {
	const normalized = Math.max(0, Math.min(1, Number(value ?? 0)));
	if (normalized <= 0) {
		return -400;
	}
	if (normalized >= 1) {
		return 400;
	}
	return -Math.log(1 / normalized - 1);
}

function toShDc(value) {
	return (Math.max(0, Math.min(1, Number(value ?? 0))) - 0.5) / SH_C0;
}

function writeBaseSplatRow(columnsByName, index, row) {
	columnsByName.x[index] = Number(row.x ?? 0);
	columnsByName.y[index] = Number(row.y ?? 0);
	columnsByName.z[index] = Number(row.z ?? 0);
	columnsByName.scale_0[index] = toLogScale(row.scaleX);
	columnsByName.scale_1[index] = toLogScale(row.scaleY);
	columnsByName.scale_2[index] = toLogScale(row.scaleZ);
	columnsByName.f_dc_0[index] = toShDc(row.r);
	columnsByName.f_dc_1[index] = toShDc(row.g);
	columnsByName.f_dc_2[index] = toShDc(row.b);
	columnsByName.opacity[index] = toLogit(row.opacity);
	columnsByName.rot_0[index] = Number(row.quatW ?? 1);
	columnsByName.rot_1[index] = Number(row.quatX ?? 0);
	columnsByName.rot_2[index] = Number(row.quatY ?? 0);
	columnsByName.rot_3[index] = Number(row.quatZ ?? 0);
}

function writeShBand(
	columnsByName,
	index,
	targetCoefficientCount,
	targetOffset,
	band,
) {
	if (
		!(band instanceof Float32Array) ||
		targetCoefficientCount <= targetOffset
	) {
		return 0;
	}

	const sourceCoefficientCount = Math.floor(band.length / 3);
	if (sourceCoefficientCount <= 0) {
		return 0;
	}

	const copyCount = Math.min(
		sourceCoefficientCount,
		targetCoefficientCount - targetOffset,
	);
	for (let channel = 0; channel < 3; channel += 1) {
		const sourceBase = channel * sourceCoefficientCount;
		const targetBase = channel * targetCoefficientCount + targetOffset;
		for (let coefficient = 0; coefficient < copyCount; coefficient += 1) {
			const targetColumn = columnsByName[`f_rest_${targetBase + coefficient}`];
			if (targetColumn) {
				targetColumn[index] = Number(band[sourceBase + coefficient] ?? 0);
			}
		}
	}
	return copyCount;
}

function writeShRow(columnsByName, index, maxShBands, sh1, sh2, sh3) {
	const targetCoefficientCount = SH_COEFFICIENTS_BY_BAND[maxShBands];
	if (targetCoefficientCount <= 0) {
		return;
	}

	let targetOffset = 0;
	targetOffset += writeShBand(
		columnsByName,
		index,
		targetCoefficientCount,
		targetOffset,
		sh1,
	);
	targetOffset += writeShBand(
		columnsByName,
		index,
		targetCoefficientCount,
		targetOffset,
		sh2,
	);
	writeShBand(columnsByName, index, targetCoefficientCount, targetOffset, sh3);
}

async function readSogColumnsFromPly(
	bytes,
	{ maxShBands = 2, onStage = null } = {},
) {
	onStage?.("parse-header");
	const reader = new PlyReader({ fileBytes: bytes });
	await reader.parseHeader();
	const serializedColumns = createSerializedSogColumns(
		reader.numSplats,
		maxShBands,
	);
	const columnsByName = getColumnLookup(serializedColumns);
	onStage?.("parse-ply");
	reader.parseSplats(
		(
			index,
			x,
			y,
			z,
			scaleX,
			scaleY,
			scaleZ,
			quatX,
			quatY,
			quatZ,
			quatW,
			opacity,
			r,
			g,
			b,
		) => {
			writeBaseSplatRow(columnsByName, index, {
				x,
				y,
				z,
				scaleX,
				scaleY,
				scaleZ,
				quatX,
				quatY,
				quatZ,
				quatW,
				opacity,
				r,
				g,
				b,
			});
		},
		(index, sh1, sh2, sh3) => {
			writeShRow(
				columnsByName,
				index,
				serializedColumns.maxShBands,
				sh1,
				sh2,
				sh3,
			);
		},
	);
	return serializedColumns;
}

async function readSogColumnsFromSpz(
	bytes,
	{ maxShBands = 2, onStage = null } = {},
) {
	onStage?.("parse-header");
	const reader = new SpzReader({ fileBytes: bytes });
	await reader.parseHeader();
	const serializedColumns = createSerializedSogColumns(
		reader.numSplats,
		maxShBands,
	);
	const columnsByName = getColumnLookup(serializedColumns);
	onStage?.("parse-spz");
	await reader.parseSplats(
		(index, x, y, z) => {
			columnsByName.x[index] = Number(x ?? 0);
			columnsByName.y[index] = Number(y ?? 0);
			columnsByName.z[index] = Number(z ?? 0);
		},
		(index, alpha) => {
			columnsByName.opacity[index] = toLogit(alpha);
		},
		(index, r, g, b) => {
			columnsByName.f_dc_0[index] = toShDc(r);
			columnsByName.f_dc_1[index] = toShDc(g);
			columnsByName.f_dc_2[index] = toShDc(b);
		},
		(index, scaleX, scaleY, scaleZ) => {
			columnsByName.scale_0[index] = toLogScale(scaleX);
			columnsByName.scale_1[index] = toLogScale(scaleY);
			columnsByName.scale_2[index] = toLogScale(scaleZ);
		},
		(index, quatX, quatY, quatZ, quatW) => {
			columnsByName.rot_0[index] = Number(quatW ?? 1);
			columnsByName.rot_1[index] = Number(quatX ?? 0);
			columnsByName.rot_2[index] = Number(quatY ?? 0);
			columnsByName.rot_3[index] = Number(quatZ ?? 0);
		},
		(index, sh1, sh2, sh3) => {
			writeShRow(
				columnsByName,
				index,
				serializedColumns.maxShBands,
				sh1,
				sh2,
				sh3,
			);
		},
	);
	return serializedColumns;
}

export async function readSerializedSogColumnsFromInput(
	{ inputBytes, inputFileName, sogMaxShBands = 2, fileType = null } = {},
	{ onStage = null } = {},
) {
	const bytes =
		inputBytes instanceof Uint8Array
			? inputBytes
			: new Uint8Array(inputBytes ?? new ArrayBuffer(0));
	const inputKind = (fileType ?? getPathExtension(inputFileName)).toLowerCase();

	switch (inputKind) {
		case "ply":
			return await readSogColumnsFromPly(bytes, {
				maxShBands: sogMaxShBands,
				onStage,
			});
		case "spz":
			return await readSogColumnsFromSpz(bytes, {
				maxShBands: sogMaxShBands,
				onStage,
			});
		default:
			throw new Error(
				`SOG compression currently supports embedded PLY/SPZ sources. Received "${inputKind || "unknown"}".`,
			);
	}
}

export function buildDataTableFromSerializedSogColumns(
	serializedColumns,
	{ Column, DataTable },
) {
	return new DataTable(
		serializedColumns.columnNames.map(
			(name, index) =>
				new Column(
					name,
					serializedColumns.columnData[index] instanceof Float32Array
						? serializedColumns.columnData[index]
						: new Float32Array(serializedColumns.columnData[index]),
				),
		),
	);
}
