import { arc } from "d3";
import { calculateLayoutGeometry } from "./layout-geometry.js";
import { orderPartyBlocks } from "./party-ordering.js";
import { generateSeatSlots } from "./seat-slots.js";

export function layoutChamber(
  selection,
  width,
  height,
  rowCount,
  seats,
  partyOf,
  partyOrder
) {
  if (!selection || typeof selection.selectAll !== "function") {
    throw new TypeError("selection must be a D3 selection");
  }
  if (!Array.isArray(seats)) {
    throw new TypeError("seats must be an array");
  }

  const geometry = calculateLayoutGeometry(width, height, rowCount, seats.length);
  const slots = generateSeatSlots(geometry);
  const {
    orderedSeats,
    orderedParties,
    orderedSlots,
    boundaryRays
  } = orderPartyBlocks(seats, partyOf, partyOrder, slots, geometry);
  const seatData = orderedSlots.map((slot, index) => ({
    ...slot,
    seat: orderedSeats[index],
    party: orderedParties[index]
  }));
  const seatArc = arc()
    .innerRadius((seat) => seat.innerRadius)
    .outerRadius((seat) => seat.outerRadius)
    .startAngle((seat) => seat.startAngle)
    .endAngle((seat) => seat.endAngle);

  selection.attr(
    "data-boundary-rays",
    boundaryRays.map((boundary) => boundary.angle).join(" ")
  );

  selection
    .selectAll("path.seat")
    .data(seatData, (seat) => seat.key)
    .join("path")
    .attr("class", "seat")
    .attr("data-seat-key", (seat) => seat.key)
    .attr("data-party", (seat) => seat.party)
    .attr("transform", `translate(${geometry.centerX},${geometry.centerY})`)
    .attr("d", seatArc);

  return selection;
}
