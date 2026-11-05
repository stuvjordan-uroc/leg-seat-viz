import assert from "node:assert/strict";
import test from "node:test";
import { calculateLayoutGeometry } from "../src/layout-geometry.js";

test("places full rows inside with a smaller remainder row at the outside", () => {
  const geometry = calculateLayoutGeometry(800, 500, 11, 435);

  assert.deepEqual(geometry.rowCounts, [
    40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 35
  ]);
  assert.ok(
    geometry.rowCounts
      .slice(0, -1)
      .every((count) => count === geometry.maxSeatsPerRow)
  );
  assert.equal(geometry.rowCounts.reduce((sum, count) => sum + count, 0), 435);
});

test("sizes the shared pitch and gap to complete a semicircle for full rows", () => {
  const geometry = calculateLayoutGeometry(800, 500, 11, 435);

  assert.ok(geometry.angularGap > 0);
  assert.ok(geometry.seatAngle > 0);
  assert.ok(
    Math.abs(geometry.seatAngle + geometry.angularGap - geometry.angularPitch) <
      Number.EPSILON * 10
  );
  assert.ok(
    Math.abs(
      geometry.maxSeatsPerRow * geometry.angularPitch - geometry.angularGap -
        Math.PI
    ) < Number.EPSILON * 10
  );
});

test("keeps row gaps under the maximum and seat depth positive", () => {
  const geometry = calculateLayoutGeometry(800, 500, 11, 435);

  assert.equal(geometry.centerX, 400);
  assert.equal(geometry.centerY, 484);
  assert.equal(geometry.innerRadius, 20);
  assert.ok(geometry.rowGap > 0);
  assert.ok(geometry.rowGap <= 8);
  assert.ok(geometry.seatDepth > 0);
  assert.ok(
    Math.abs(
      11 * geometry.seatDepth +
        10 * geometry.rowGap -
        (geometry.outerRadius - geometry.innerRadius)
    ) < Number.EPSILON * geometry.outerRadius * 10
  );
});

test("keeps seat angles and radial gaps positive for many rows", () => {
  const geometry = calculateLayoutGeometry(800, 500, 100, 10000);

  assert.ok(geometry.rowGap < 8);
  assert.ok(geometry.seatAngle > 0);
  assert.ok(geometry.seatDepth > 0);
});

test("rejects invalid counts, dimensions, and unusable margins", () => {
  assert.throws(() => calculateLayoutGeometry(0, 500, 11, 435), RangeError);
  assert.throws(() => calculateLayoutGeometry(800, 500, 0, 435), RangeError);
  assert.throws(() => calculateLayoutGeometry(800, 500, 11, 0), RangeError);
  assert.throws(() => calculateLayoutGeometry(20, 20, 1, 1), RangeError);
  assert.throws(() => calculateLayoutGeometry(60, 100, 1, 1), RangeError);
});
