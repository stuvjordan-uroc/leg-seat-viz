const EDGE_MARGIN = 16;
const INNER_RADIUS = 20;
const MAX_ANGULAR_GAP = 0.02;
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

  const seatsPerRow = Math.floor(seatCount / rowCount);
  const extraSeats = seatCount % rowCount;
  const rowCounts = Array.from(
    { length: rowCount },
    (_, index) => seatsPerRow + (index < extraSeats ? 1 : 0)
  );
  const maxSeatsPerRow = seatsPerRow + (extraSeats > 0 ? 1 : 0);
  const angularPitch =
    Math.PI / (2 * Math.ceil(maxSeatsPerRow / 2));
  const angularGap = Math.min(MAX_ANGULAR_GAP, angularPitch / 3);
  const seatAngle = angularPitch - angularGap;
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
  const rowGap = Math.min(MAX_ROW_GAP, radialSpace / (2 * rowCount));
  const seatDepth =
    (radialSpace - rowGap * (rowCount - 1)) / rowCount;

  return {
    rowCounts,
    maxSeatsPerRow,
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
