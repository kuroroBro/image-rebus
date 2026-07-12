# Tasks: Rebus Rumble

## Phase 1 — Rules engine
- [x] `js/game.js`: state factory (`createGame`) + pure functions
      (`startGame`, `awardPoint`, `skipPuzzle`) — deck build/shuffle, target
      score, win-by-score-comparison-or-draw. No timer, no hints (see
      plan.md Decision #7).
- [x] `tests/game.test.mjs`: 13 tests — deck construction, award/skip,
      target-score win, deck-exhaustion win/draw, deterministic rng.
- [x] `node --test tests/game.test.mjs` passes before any UI exists.

## Phase 2 — Content
- [x] `js/puzzles.js`: 14 classic typographic rebus puzzles.
- [x] Generate/render card images — 7 via the `image-gen` skill (verified
      individually against the intended text before keeping), 7 rendered
      locally via HTML/CSS + headless-browser screenshot (see plan.md
      Decision #2). Every AI-generated card was read back and visually
      checked for spelling/layout correctness before being kept — none
      needed a redo.
- [x] Optimize images: thresholded the 7 AI-generated PNGs to pure 2-color
      and palette-quantized (they were noisy RGB from generation despite
      being pure black/white content) — 14 cards, 216KB total.
- [x] Renamed every image to an opaque `card-NN.png` after catching that
      answer-derived filenames leaked the answer to the Display (plan.md
      Decision #4).

## Phase 3 — Settings persistence
- [x] `js/storage.js`: last-used team names + target score in localStorage,
      `DEFAULT_SETTINGS` as the single source of defaults.

## Phase 4 — UI
- [x] `index.html`: home, setup (team names + target score only), host
      lobby, host panel (card image + full answer + award/skip), display
      (card image + scores only), game over.
- [x] `css/styles.css`: own palette (plan.md Decision #6).
- [x] `js/main.js`: DOM wiring against `js/game.js`.

## Phase 5 — Networking
- [x] `js/room.js`: adapted from `icon-guess-the-word`, ID prefix
      `rebus-room-`.
- [x] Vendor `vendor/peerjs.min.js`.
- [x] `js/main.js`: redaction (`answer` and `id` stripped before
      broadcast), Host vs. Display role wiring.
- [x] Playwright playtest: 2 tabs (Host + Display), full loop (lobby →
      award/skip → target-score win, verified separately deck-exhaustion
      win/draw at the engine-test level) → play again path exists via
      `btn-play-again`.
- [x] Automated leak check: scanned the Display's DOM/network payload for
      every known answer word/slug after each state update. First pass
      failed (found the answer-derived image filename, plan.md Decision
      #4); fixed and re-verified clean with a check scoped to exactly the
      `#screen-display` subtree.

## Phase 6 — Deploy
- [x] `.github/workflows/deploy.yml`: test job gating GitHub Pages deploy of
      repo root.
- [x] `.nojekyll` at repo root.
- [x] `README.md`.
- [ ] Push to `kuroroBro/image-rebus`, confirm GitHub Pages live URL serves
      the current build.

## Phase 7 — Expanded puzzle set from user-supplied CSV (post-launch addition)
- [x] Reviewed ~50 candidate puzzles from a user-supplied CSV; kept 8 with
      an unambiguous single answer and a layout achievable in pure
      HTML/CSS (no illustrated icon needed): BACKSTAB, FADE OUT, ONCE IN A
      BLUE MOON, SMALL ISSUE, WINDOWPANE, COVER TO COVER, CUT PRICE, BIG
      DEAL. See plan.md Changelog v1.1 for what was dropped and why.
- [x] Rendered and visually verified all 8 via the same HTML/CSS +
      headless-screenshot pipeline as Phase 2; optimized each with a
      palette sized to its actual content (2-color for pure B&W cards, a
      16-gray palette for the fade-out gradient, small color palettes for
      the two cards where color is the puzzle's mechanism).
- [x] `js/puzzles.js` updated to 22 total puzzles, `image` filenames
      continuing the opaque `card-NN.png` sequence (card-15 .. card-22).
- [x] Re-ran the full test suite (13/13) and a live 2-tab Playwright
      playtest against the expanded deck.

## Phase 8 — User-directed puzzles + first illustrated icons (post-launch addition)
- [x] Built SHUTDOWN ("SHUT"/"DOWN" stacked); removed immediately at the
      user's request ("seem incorrect") — never added to `js/puzzles.js`.
- [x] Added a reusable CSS clip-path staircase to the shared card template
      (`.staircase-up`, `.staircase-down`) and built STEPFATHER (ascending
      staircase under "FATHER") and STEP DOWN (descending staircase toward
      a lower-right "DOWN") — the user's "the ladder from stepfather then
      Down on lower right" instruction, read as two puzzles sharing one
      graphic.
- [x] Generated 5 object-only icons via the image-gen skill in a single
      batch (no text in any prompt): `images/icons/{clock,fish,ribbon,
      pouch,road-fork}.png`. All verified individually.
- [x] Composited 4 of the 5 into full cards via HTML (`ai-icon:` source
      type, plan.md Decision #8): HIGH NOON, FISH OUT OF WATER, ZIP IT,
      CROSSROADS.
- [x] Attempted AROUND THE WORLD with `ribbon.png`; dropped after two
      layout attempts both failed to read unambiguously (overlapping the
      text hid it entirely; stacking the bow above the word didn't clearly
      encode "around"). Deleted the now-unused `ribbon.png`.
- [x] `js/puzzles.js` updated to 28 total puzzles (card-23 .. card-28);
      re-ran the full test suite (13/13) and a live Playwright playtest.

## Phase 9 — Owner revisions to 5 Phase 8 cards (post-launch addition)
- [x] FISH OUT OF WATER: replaced "DISH"+fish with a "WATER"-labeled oval
      and the fish positioned outside it (plan.md Changelog v1.3).
- [x] ZIP IT: replaced redundant "ZIP" caption with "IT" (the pouch icon
      already reads as "zip").
- [x] FADE OUT: replaced the fading "PROGRAM" with 5 stacked, progressively
      transparent copies of "OUT" — the answer's own word now fades.
- [x] BACKSTAB: replaced the plain "EFINK" text card with a new
      `images/icons/knife.png` (generated, then background chroma-keyed
      transparent) stabbing into the "K" of "BACK".
- [x] BIG DEAL: replaced the single giant "DEAL" with a small "DEAL", an
      SVG arrow, and a large "DEAL" — the comparison is now on the card.
- [x] CROSSROADS: replaced redundant "ROADS"+fork with a large "X" (cross)
      above the plain fork icon (road(s)).
- [x] All 5 re-optimized (palette sized to content) and re-verified: full
      test suite (13/13), live 2-tab Playwright playtest, every puzzle
      image confirmed present on disk.

## Phase 10 — CROSSROADS and HIGH NOON simplified to icon-free (post-launch addition)
- [x] CROSSROADS: replaced "X" + road-fork icon with a large red "X"
      overlaid directly on the word "ROADS".
- [x] HIGH NOON: replaced clock icon + "NOON" with "NOON" repeated 6x in
      one column, tapering from 150px to 36px (inverse-pyramid taper reads
      as "high").
- [x] Deleted `images/icons/clock.png` and `images/icons/road-fork.png` —
      no puzzle references either anymore. `images/icons/` now holds only
      the 3 icons actually in use (fish, knife, pouch).
- [x] Re-verified: 13/13 tests, live Playwright playtest, every puzzle
      image confirmed present on disk.

## Phase 11 — Fill gap against the original reference photo (post-launch addition)
- [x] Audited all 12 cards from the original reference photo against
      `js/puzzles.js`; found 3 never built and 1 built in simplified form
      (see plan.md Changelog v1.5).
- [x] Built TRAVEL OVERSEAS ("TRAVEL" over a line over "CCCCCCC" — matches
      the reference photo layout exactly), 3D MOVIE ("D D D" + "MOVIE"),
      TRY TO UNDERSTAND ("TRY TO" above the I/STAND fraction, as a new
      puzzle alongside — not replacing — the plain UNDERSTAND card), and
      ONCE UPON A TIME ("ONCE" + a regenerated clock icon).
- [x] Regenerated `images/icons/clock.png` (deleted in v1.4 as unused,
      needed again here) with a background-transparency fix applied after
      generation, same as the knife icon in Phase 9.
- [x] `js/puzzles.js` updated to 32 total puzzles (card-29 .. card-32);
      re-ran the full test suite (13/13) and a live Playwright playtest.

## Open backlog (intentionally deferred)

- A second puzzle category/set, plus the category-selection UI that would
  come with it (plan.md Decision #5) — not built until there's a second set
  worth choosing between.
- Any of the two heavier frameworks from the original brief (Bidding War's
  reveal-token economy, Combo Builder's card hands + modifier deck) — the
  brief asked for the simpler version for this build; these remain
  available as a genuinely separate future game concept, not a v2 of this
  one, if ever wanted.
- Optional timer, matching the sibling games' "Time per Puzzle" setting —
  deliberately left out of v1 (Decision #7); could be added the same way
  `icon-guess-the-word` has it, without disturbing the core loop.
- A hero background image for the home screen, matching the pattern added
  to `turbo-taboo` / `fluffy-Neanderthal` / `attack-attack` — not built yet
  for this game, no request for it so far.
