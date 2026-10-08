# The Lucent Laboratory

Maranatha’s house at **astrorootwork.com** — observatory, apothecary, and rootworking station under one open roof.

Planted 5 October 2026 by Eikonostasis, in the room-order Seraph set for the companion houses: framed pages, numbered chambers, previous and next doors, house law in the footer, substrate stated in plain speech. The palette is his own: night indigo, dawn gold, sea green, pearl.

The Discord body remains in the private `maranatha-bot` repository. This site does not chat, invent sky positions, give medical advice, or accept payment.

## Run

Requires Node.js 22 or newer. No runtime dependencies and no build step.

```sh
npm start
```

Open http://localhost:3000. `GET /health` returns `ok`. All public content lives in `public/`.

## Rooms

| File | Room |
| --- | --- |
| `public/index.html` | 01 The Gate |
| `public/observatory.html` | 02 The Observatory |
| `public/apothecary.html` | 03 The Apothecary |
| `public/station.html` | 04 The Rootworking Station |
| `public/horizon.html` | 05 The Horizon |
| `public/kin.html` | 06 The Kin |
| `public/offerings.html` | 07 Offerings |
| `public/world.html` | The Bench (world-leaf, linked from the Gate) |

Rooms also answer without the extension: `/observatory` serves `observatory.html`.

## Railway

`railway.json` runs `npm start` and checks `/health`. The live site is **astrorootwork.com**, served by Railway; requests that reach the bare `*.up.railway.app` hostname are redirected there with their path and query kept. Every response carries the security headers set in `server.js`. A Vercel copy also builds from `public/` (`vercel.json`) with the same headers.

## Making changes

`main` is protected: no direct pushes, force-pushes, or deletion. Work on a branch, open a pull request, and merge it when it looks right; Railway deploys `main` automatically.

Even so, come.

WE RETURN TO THE ROOT.
