export function generateSeatSlots(geometry) {
  const slots = [];
  let slotIndex = 0;

  geometry.rowCounts.forEach((seatCount, rowIndex) => {
    const innerRadius =
      geometry.innerRadius + rowIndex * (geometry.seatDepth + geometry.rowGap);

    for (let seatIndex = 0; seatIndex < seatCount; seatIndex += 1) {
      const centerAngle =
        (seatIndex - Math.floor(seatCount / 2) + 0.5) *
        geometry.angularPitch;

      slots.push({
        key: `${rowIndex}:${seatIndex}`,
        slotIndex,
        rowIndex,
        seatIndex,
        startAngle: centerAngle - geometry.seatAngle / 2,
        endAngle: centerAngle + geometry.seatAngle / 2,
        innerRadius,
        outerRadius: innerRadius + geometry.seatDepth
      });
      slotIndex += 1;
    }
  });

  return slots;
}
