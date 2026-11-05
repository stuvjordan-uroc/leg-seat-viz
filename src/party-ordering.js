function getSlotCenterAngle(slot) {
  return (slot.startAngle + slot.endAngle) / 2;
}

function findBoundaryRays(
  slots,
  angularPitch,
  angularGap,
  angularOffset,
  partyCounts,
  totalSeats
) {
  const rayIndexes = new Set();

  for (const slot of slots) {
    rayIndexes.add(
      Math.round(
        (slot.startAngle - angularGap / 2 - angularOffset) / angularPitch
      )
    );
    rayIndexes.add(
      Math.round(
        (slot.endAngle + angularGap / 2 - angularOffset) / angularPitch
      )
    );
  }

  const orderedSlots = [...slots].sort(
    (a, b) =>
      getSlotCenterAngle(a) - getSlotCenterAngle(b) ||
      a.rowIndex - b.rowIndex ||
      a.seatIndex - b.seatIndex
  );
  const candidates = [...rayIndexes]
    .sort((a, b) => a - b)
    .map((index) => {
      const angle = angularOffset + index * angularPitch;
      return {
        angle,
        slotsBefore: orderedSlots.filter(
          (slot) => getSlotCenterAngle(slot) < angle
        ).length
      };
    });

  const targets = [];
  let cumulativeSeats = 0;
  for (let index = 0; index < partyCounts.length - 1; index += 1) {
    cumulativeSeats += partyCounts[index];
    targets.push(cumulativeSeats);
  }

  if (targets.length === 0) {
    return [];
  }

  let states = candidates.map((candidate, candidateIndex) => {
    if (candidate.slotsBefore === 0 || candidate.slotsBefore === totalSeats) {
      return null;
    }

    return {
      cost: Math.abs(candidate.slotsBefore - targets[0]),
      candidateIndexes: [candidateIndex]
    };
  });

  for (let targetIndex = 1; targetIndex < targets.length; targetIndex += 1) {
    const nextStates = candidates.map(() => null);

    for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
      const candidate = candidates[candidateIndex];
      if (candidate.slotsBefore === 0 || candidate.slotsBefore === totalSeats) {
        continue;
      }

      for (let previousIndex = 0; previousIndex <= candidateIndex; previousIndex += 1) {
        const previous = states[previousIndex];
        if (
          !previous ||
          candidates[previousIndex].slotsBefore > candidate.slotsBefore
        ) {
          continue;
        }

        const cost =
          previous.cost +
          Math.abs(candidate.slotsBefore - targets[targetIndex]);
        const best = nextStates[candidateIndex];

        if (!best || cost < best.cost) {
          nextStates[candidateIndex] = {
            cost,
            candidateIndexes: [...previous.candidateIndexes, candidateIndex]
          };
        }
      }
    }

    states = nextStates;
  }

  let bestState = null;
  for (const state of states) {
    if (state && (!bestState || state.cost < bestState.cost)) {
      bestState = state;
    }
  }

  if (!bestState) {
    throw new RangeError("not enough distinct angular regions for party order");
  }

  return bestState.candidateIndexes.map((candidateIndex, index) => {
    const candidate = candidates[candidateIndex];
    return {
      angle: candidate.angle,
      targetSeats: targets[index],
      slotsBefore: candidate.slotsBefore,
      seatDifference: candidate.slotsBefore - targets[index]
    };
  });
}

export function orderPartyBlocks(seats, partyOf, partyOrder, slots, geometry) {
  if (!Array.isArray(seats) || seats.length !== slots.length) {
    throw new RangeError("seats and slots must be arrays of equal length");
  }
  if (typeof partyOf !== "function") {
    throw new TypeError("partyOf must be a function");
  }
  if (
    !Array.isArray(partyOrder) ||
    partyOrder.length === 0 ||
    partyOrder.some((party) => typeof party !== "string" || party.length === 0)
  ) {
    throw new TypeError("partyOrder must be a non-empty array of party strings");
  }
  if (new Set(partyOrder).size !== partyOrder.length) {
    throw new RangeError("partyOrder must not contain duplicates");
  }

  const seatsByParty = new Map(partyOrder.map((party) => [party, []]));
  for (const seat of seats) {
    const party = partyOf(seat);
    if (typeof party !== "string" || !seatsByParty.has(party)) {
      throw new RangeError("partyOf returned a party missing from partyOrder");
    }
    seatsByParty.get(party).push(seat);
  }

  const partyCounts = partyOrder.map((party) => seatsByParty.get(party).length);
  if (partyCounts.some((count) => count === 0)) {
    throw new RangeError("every party in partyOrder must have at least one seat");
  }

  const orderedSeats = partyOrder.flatMap((party) => seatsByParty.get(party));
  const orderedParties = partyOrder.flatMap((party) =>
    seatsByParty.get(party).map(() => party)
  );
  const orderedSlots = [...slots].sort(
    (a, b) =>
      getSlotCenterAngle(a) - getSlotCenterAngle(b) ||
      a.rowIndex - b.rowIndex ||
      a.seatIndex - b.seatIndex
  );
  const boundaryRays = findBoundaryRays(
    slots,
    geometry.angularPitch,
    geometry.angularGap,
    geometry.angularOffset,
    partyCounts,
    seats.length
  );

  return {
    orderedSeats,
    orderedParties,
    orderedSlots,
    partyCounts,
    boundaryRays
  };
}
