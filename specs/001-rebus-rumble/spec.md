# Feature Specification: Rebus Rumble

**Feature branch**: `001-rebus-rumble`
**Status**: Draft
**Created**: 2026-07-12

## Overview

A free, ad-free party game that runs entirely in the browser and is hosted on
GitHub Pages — no backend, no build step to serve. Two teams race to solve
classic **typographic rebus puzzles**: word position, size, repetition, a
visual break, or a number/letter standing in for its sound, encoding a word
or phrase — "I" over "STAND" is UNDERSTAND, "B4" is BEFORE, "GET IT"
repeated four times is FORGET IT. (Earlier drafts of this spec described a
different, icon-pair puzzle format — sun + flower = SUNFLOWER — based on a
misreading of the brief before reference examples were shared; that format
was never shipped. See plan.md Changelog v1 for the correction.)

A **Host** (emcee) holds a private control screen with the answer; a shared
**Display** screen (a TV or laptop everyone can see) shows only the puzzle
card. Teams shout their guess out loud as soon as they think they've got it;
the Host taps which team got it right. No typing, no per-player devices, no
timer, no hints, no bidding tokens — this is deliberately the simplest of
the three rebus formats the game concept was drawn from ("Real-Time Race",
"Bidding War", "Combo Builder"): flip the card, shout, tap who got it, next
card. Same Host-judged, no-typing input convention as the sibling project
`icon-guess-the-word` ("Emoji Says").

## User Stories

### US-1: Set up a game (host)
As a host, I want to name the two teams and optionally set a target score, so
the game fits how long my group wants to play.

**Acceptance criteria**
- Can rename the two teams (default "Team A" / "Team B").
- Can set a **Target Score** (Off/"play through the deck", or First to
  3/5/7/10) at setup time. When set, the first team to reach that score wins
  immediately. When off (the default), the deck runs out and the higher
  score wins (a tie is a draw).
- The Host can optionally restrict the deck to one card category (Classic
  Wordplay, Phrases & Idioms, or Picture Clues) instead of the full mixed
  set — see plan.md Decision #11.

### US-2: Play a round (host-judged, no typing, no timer)
As a host running the game, I want to flip a rebus card and award the point
to whichever team shouts the correct answer first, so the group can just
play without anyone typing, dragging, or racing a clock.

**Acceptance criteria**
- The Display always shows the current puzzle's card image, large enough to
  read from across a room, plus both team scores.
- The Host screen shows the same card **plus** the full answer spelled out,
  and the round controls.
- The Host has two big buttons, **Team A got it** / **Team B got it** —
  tapping one scores a point for that team and deals the next puzzle.
- The Host has a **Skip** control — deals the next puzzle with no point
  awarded (for a puzzle nobody can get).
- No timer, no auto-skip, no letter hints, no partial reveal — the full
  puzzle card is visible on both screens the instant it's dealt, and stays
  visible (at full clarity) until the Host awards or skips.
- Puzzles are never repeated within a game. When the deck is exhausted, the
  game ends and shows the final score and winner (a tie is a draw).

### US-3: One Host, one Display, one room
As a host, I want my controller screen and the shared TV/laptop screen to
show the same live game, so I don't need anyone else's phone.

**Acceptance criteria**
- Setup (team names, target score) is completed first; only then does the
  Host tap **Start Room**, which opens the room and shows a short,
  human-friendly code. The Display can't join before this point.
- The Display device joins by typing in the code — peer-to-peer WebRTC via
  the public PeerJS broker, the same approach used in every sibling project.
- Only the Host device can act (award a point, skip). The Display is a pure
  render target and never sends actions.
- The Display never receives the answer over the network, not just hides it
  in the UI: the Host sends a redacted snapshot (`answer` field stripped,
  and — critically — the descriptive `id` field stripped too) to the room.
  **The puzzle image's own filename must never spell out the answer either**
  (e.g. `card-01.png`, not `understand.png`) — a Display-side player could
  otherwise read the answer straight off the image URL before anyone
  shouts anything. This was caught as a real bug during v1 development (a
  first pass redacted `answer` and `id` from the JS payload but still
  shipped answer-derived filenames) — see plan.md Decision #4.
  The puzzle card image itself is *not* secret (it's the puzzle everyone's
  meant to see) — only the answer text and anything that could reconstruct
  it are withheld.
- If the room service is unreachable, the app says so in plain language.
  This game has no meaningful single-device mode (the Host screen shows the
  answer, so it can't double as the shared Display) — a working room is a
  real requirement of play.

## Functional Requirements

- **FR-1** Static site only: must run from GitHub Pages (no backend, no
  build step required to serve).
- **FR-2** Game logic must be a pure, testable module (no DOM reads/writes
  inside the rules).
- **FR-3** Host-authoritative networking: only the Host mutates state; the
  Display renders whatever snapshot it last received. No client ever sends
  an action.
- **FR-4** No in-game currency, tokens, or lives — score is the only
  persistent-within-a-game number.
- **FR-5** Mobile-first UI with large tap targets on the Host screen; the
  Display screen is optimized for being read from across a room (large card
  image, large score plaques).
- **FR-6** No ads, no analytics, no tracking.

## Non-goals

- No timer, no auto-skip, no letter-by-letter reveal, and no bidding-token
  economy — deliberately the simplest of the three frameworks the concept
  was drawn from. These could be later, separately-scoped additions but are
  explicitly out for v1.
- No per-player devices, no card hands, no turn-taking between teams
  (the "Combo Builder" framework's shape) — both teams see the same puzzle
  at the same time and race to shout first.
- No *custom* categories — the Host can filter the built-in deck down to
  one of three fixed categories (Decision #11), but can't define new ones
  or upload a separate puzzle set.
- No accounts, matchmaking, or cross-room/cross-game history.
- No emoji-based puzzles — every puzzle clue is an image (see plan.md
  Decisions), not text/emoji, per the explicit "use image instead" request
  that started this project.

## Key Entities

- **Settings**: team names, target score (0/null = off).
- **Team**: id, name, score.
- **Puzzle** (the rebus unit): `id` (descriptive, source-only — never sent
  over the network), `answer` (the solution text, Host-only), `image` (an
  opaque filename, e.g. `card-01.png` — sent to the Display), `description`
  (the exact spec used to generate/render the card, for regeneration —
  source-only, never sent).
- **Game**: phase (`lobby → playing → gameover`), teams, deck (shuffled
  puzzles), puzzle index, target score.
- **Room**: 4-letter code, host peer connection, display connection(s).
