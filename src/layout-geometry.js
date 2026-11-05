const EDGE_MARGIN = 16;
const INNER_RADIUS = 20;
const MAX_ROW_GAP = 8;

export function calculateLayoutGeometry(width, height, rowCount, seatCount) {
  if (!Number.isFinite(width) || width <= 0) {
    throw new RangeError("width must be a positive finite number");
  }
  if (!Number.isFinite(height) || height <= 0) {
    throw new RangeError("height must be a positive finite number");
  }
  if (!Number.isInteger(rowCount) || rowCount <= 0) {
    throw new RangeError("rowCount must be a positive integer");
  }
  if (!Number.isInteger(seatCount) || seatCount <= 0) {
    throw new RangeError("seatCount must be a positive integer");
  }

  const maxSeatsPerRow = Math.ceil(seatCount / rowCount);
  const fullRows = Math.floor(seatCount / maxSeatsPerRow);
  const remainderSeats = seatCount % maxSeatsPerRow;
  const rowCounts = Array.from({ length: rowCount }, (_, index) => {
    if (index < fullRows) {
      return maxSeatsPerRow;
    }
    if (index === fullRows) {
      return remainderSeats;
    }
    return 0;
  });
  const occupiedRowCount = rowCounts.filter((count) => count > 0).length;
  const angularPitch = Math.PI / (maxSeatsPerRow - 1 / 3);
  const angularGap = angularPitch / 3;
  const seatAngle = angularPitch - angularGap;
  const angularOffset = maxSeatsPerRow % 2 === 1 ? -angularPitch / 2 : 0;
  const centerX = width / 2;
  const centerY = height - EDGE_MARGIN;
  const outerRadius = Math.min(
    width / 2 - EDGE_MARGIN,
    centerY - EDGE_MARGIN
  );

  if (outerRadius <= INNER_RADIUS) {
    throw new RangeError(
      "width and height must allow for the chamber margins and inner radius"
    );
  }

  const radialSpace = outerRadius - INNER_RADIUS;
  const rowGap = Math.min(MAX_ROW_GAP, radialSpace / (2 * occupiedRowCount));
  const seatDepth =
    (radialSpace - rowGap * (occupiedRowCount - 1)) / occupiedRowCount;

  return {
    rowCounts,
    maxSeatsPerRow,
    angularOffset,
    centerX,
    centerY,
    innerRadius: INNER_RADIUS,
    outerRadius,
    angularPitch,
    angularGap,
    seatAngle,
    rowGap,
    seatDepth
  };
}
