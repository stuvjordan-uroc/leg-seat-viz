import assert from "node:assert/strict";
import test from "node:test";
import { calculateLayoutGeometry } from "../src/layout-geometry.js";
import { generateSeatSlots } from "../src/seat-slots.js";

test("generates one stable slot for every seat in the requested rows", () => {
  const geometry = calculateLayoutGeometry(800, 500, 11, 435);
  const slots = generateSeatSlots(geometry);

  assert.equal(slots.length, 435);
  assert.deepEqual(
    geometry.rowCounts.map((_, rowIndex) =>
      slots.filter((slot) => slot.rowIndex === rowIndex).length
    ),
    geometry.rowCounts
  );
  assert.equal(new Set(slots.map((slot) => slot.key)).size, 435);
  assert.deepEqual(
    slots.map((slot) => slot.slotIndex),
    Array.from({ length: 435 }, (_, index) => index)
  );
});

test("centers an odd row as closely as possible without crossing the center gap", () => {
  const geometry = calculateLayoutGeometry(800, 500, 1, 5);
  const slots = generateSeatSlots(geometry);
  const centers = slots.map((slot) => (slot.startAngle + slot.endAngle) / 2);

  assert.deepEqual(
    centers.map((angle) => Math.round(angle / geometry.angularPitch * 2) / 2),
    [-1.5, -0.5, 0.5, 1.5, 2.5]
  );
  assert.ok(slots.every((slot) => slot.endAngle < Math.PI / 2));
  assert.ok(slots.every((slot) => slot.startAngle > -Math.PI / 2));
});

test("keeps angular gap lanes aligned across rows", () => {
  const geometry = calculateLayoutGeometry(800, 500, 2, 9);
  const slots = generateSeatSlots(geometry);

  for (const slot of slots) {
    const gapLaneIndex = (slot.startAngle - geometry.angularGap / 2) /
      geometry.angularPitch;

    assert.ok(Math.abs(gapLaneIndex - Math.round(gapLaneIndex)) < 1e-12);
  }
});

test("places rows in increasing radial bands with the configured row gap", () => {
  const geometry = calculateLayoutGeometry(800, 500, 11, 435);
  const slots = generateSeatSlots(geometry);

  for (let rowIndex = 0; rowIndex < geometry.rowCounts.length; rowIndex += 1) {
    const rowSlots = slots.filter((slot) => slot.rowIndex === rowIndex);
    const expectedInnerRadius =
      geometry.innerRadius + rowIndex * (geometry.seatDepth + geometry.rowGap);

    assert.ok(
      rowSlots.every(
        (slot) =>
          Math.abs(slot.innerRadius - expectedInnerRadius) < 1e-12 &&
          Math.abs(slot.outerRadius - expectedInnerRadius - geometry.seatDepth) <
            1e-12
      )
    );
  }

  assert.ok(slots.every((slot) => slot.innerRadius >= geometry.innerRadius));
  assert.ok(
    Math.abs(
      Math.max(...slots.map((slot) => slot.outerRadius)) - geometry.outerRadius
    ) < 1e-12
  );
});

test("starts the innermost row at the 20px inner radius", () => {
  const geometry = calculateLayoutGeometry(800, 500, 11, 435);
  const slots = generateSeatSlots(geometry);

  assert.ok(
    slots
      .filter((slot) => slot.rowIndex === 0)
      .every((slot) => slot.innerRadius === 20)
  );
});
