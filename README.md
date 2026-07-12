# Rebus Rumble

A free, ad-free picture-puzzle party game for 2 teams. Static site — no
backend, no build step, peer-to-peer over WebRTC, same convention as the
other games in this workspace.

## How to play

- One **Host** device (the emcee) and one shared **Display** screen (a TV
  or laptop everyone can see).
- Each round the Display shows a rebus card — a classic wordplay puzzle
  where word position, size, repetition, or a number standing in for its
  sound spells out a word or phrase (e.g. "B4" = BEFORE, "I" over "STAND"
  = UNDERSTAND).
- No typing, no buzzers — teams shout their guess out loud. The Host taps
  **Team A got it** / **Team B got it** to award the point, or **Skip** if
  nobody can get it.
- First to the target score wins (if one's set), or the higher score wins
  when the deck runs out. A tie is a draw.

## Architecture

Vanilla JS, no build step, no framework — the repo IS the deployable
artifact. See `specs/001-rebus-rumble/plan.md` for the full architecture
writeup.

- `js/game.js` — pure rules engine (deck, scoring, target score). No
  timer, no hints — deliberately the simplest of the three rebus
  frameworks this concept was drawn from.
- `js/puzzles.js` — the built-in puzzle set. Each entry records `answer`,
  `image`, and `description` (the exact spec used to generate/render that
  card, so any card can be regenerated later without reconstructing the
  prompt from scratch).
- `js/room.js` — PeerJS Host + Display networking, adapted from
  `icon-guess-the-word`.
- `js/main.js` — DOM wiring, redaction (the Host never broadcasts the
  answer), render.
- `images/cards/` — the puzzle card images. Some are AI-generated (via the
  `image-gen` skill); most are rendered locally from HTML/CSS via a
  headless-browser screenshot, since that guarantees correct spelling —
  AI image generation is unreliable at exact text.
- `tests/game.test.mjs` — unit tests (`node --test tests/game.test.mjs`).

## Run locally

Any static file server works, e.g.:

```sh
npx serve .          # or: python3 -m http.server 8080
node --test tests/game.test.mjs
```

## Deploy

Push to `main` — `.github/workflows/deploy.yml` runs the unit tests, then
publishes the repo root to GitHub Pages.
