import assert from "node:assert/strict";
import test from "node:test";
import { calculateLayoutGeometry } from "../src/layout-geometry.js";
import { orderPartyBlocks } from "../src/party-ordering.js";
import { generateSeatSlots } from "../src/seat-slots.js";

function createExample() {
  const seats = [
    { id: 1, party: "B" },
    { id: 2, party: "A" },
    { id: 3, party: "C" },
    { id: 4, party: "A" },
    { id: 5, party: "B" },
    { id: 6, party: "A" },
    { id: 7, party: "C" },
    { id: 8, party: "B" },
    { id: 9, party: "A" }
  ];
  const geometry = calculateLayoutGeometry(800, 500, 2, seats.length);
  const slots = generateSeatSlots(geometry);

  return { seats, geometry, slots };
}

test("groups seat data by the explicit party order and preserves order within groups", () => {
  const { seats, geometry, slots } = createExample();
  const result = orderPartyBlocks(
    seats,
    (seat) => seat.party,
    ["A", "B", "C"],
    slots,
    geometry
  );

  assert.deepEqual(result.orderedSeats.map((seat) => seat.party), [
    "A", "A", "A", "A", "B", "B", "B", "C", "C"
  ]);
  assert.deepEqual(result.orderedSeats.map((seat) => seat.id), [
    2, 4, 6, 9, 1, 5, 8, 3, 7
  ]);
  assert.equal(result.orderedSlots.length, seats.length);
});

test("selects ordered boundary rays nearest the cumulative party seat counts", () => {
  const { seats, geometry, slots } = createExample();
  const result = orderPartyBlocks(
    seats,
    (seat) => seat.party,
    ["A", "B", "C"],
    slots,
    geometry
  );

  assert.equal(result.boundaryRays.length, 2);
  assert.deepEqual(
    result.boundaryRays.map(({ targetSeats, slotsBefore }) => [
      targetSeats,
      slotsBefore
    ]),
    [[4, 4], [7, 6]]
  );
  assert.ok(result.boundaryRays[0].angle < result.boundaryRays[1].angle);
});

test("allows small party blocks to share a boundary ray instead of spreading them apart", () => {
  const seats = [
    ...Array.from({ length: 220 }, (_, index) => ({
      id: `D-${index}`,
      party: "D"
    })),
    { id: "I-1", party: "I" },
    { id: "V-1", party: "V" },
    ...Array.from({ length: 213 }, (_, index) => ({
      id: `R-${index}`,
      party: "R"
    }))
  ];
  const geometry = calculateLayoutGeometry(800, 500, 11, seats.length);
  const slots = generateSeatSlots(geometry);
  const result = orderPartyBlocks(
    seats,
    (seat) => seat.party,
    ["D", "I", "V", "R"],
    slots,
    geometry
  );

  assert.equal(result.boundaryRays.length, 3);
  assert.equal(result.boundaryRays[1].angle, result.boundaryRays[2].angle);
  assert.ok(result.boundaryRays.every((boundary) => Math.abs(boundary.seatDifference) <= 5));
});

test("rejects parties absent from the requested order and invalid party orders", () => {
  const { seats, geometry, slots } = createExample();

  assert.throws(
    () =>
      orderPartyBlocks(
        seats,
        (seat) => seat.party,
        ["A", "B"],
        slots,
        geometry
      ),
    /missing from partyOrder/
  );
  assert.throws(
    () =>
      orderPartyBlocks(
        seats,
        (seat) => seat.party,
        ["A", "A", "B", "C"],
        slots,
        geometry
      ),
    /must not contain duplicates/
  );
});
