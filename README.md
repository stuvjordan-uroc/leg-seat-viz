# election-viz-2026

A small D3 helper for laying out legislative chamber seats. The package can be
installed directly from this Git repository; it does not need to be published
to the npm registry.

## Install from Git

In the consuming project's directory, run:

```sh
npm install git+https://github.com/stuvjordan-uroc/leg-seat-viz.git
```

This installs the package under the name `election-viz-2026`. To pin the
dependency to a Git tag or commit instead of the default branch, append
`#<tag-or-commit>` to the URL:

```sh
npm install git+https://github.com/stuvjordan-uroc/leg-seat-viz.git#<tag-or-commit>
```

The consuming project must also have D3 7 installed, since it is a peer
dependency:

```sh
npm install d3@^7
```

## Use

```js
import { select } from "d3";
import { layoutChamber } from "election-viz-2026";

const chamber = select("#chamber").append("g");
layoutChamber(chamber, 800, 500, 35, seats, (seat) => seat.party, partyOrder);
```

`layoutChamber` expects a D3 selection, the chamber width and height, the row
count, the seats array, a function that returns each seat's party, and the
desired party order. Full rows span a complete semicircle; any partial
remainder row is placed at the outside and retains the shared radial aisle
alignment. See [`examples/basic.html`](./examples/basic.html) for a complete
browser example.
