# Plan: Rebus Rumble

**Spec**: [spec.md](./spec.md)

## Architecture

Vanilla ES2020 modules, no build step, no framework — the repo IS the
deployable artifact for GitHub Pages, same convention as every sibling game.

```
index.html            screens (home, setup, host lobby, host panel, display, gameover)
css/styles.css          puzzle-card visual theme (own palette, see Decisions)
js/game.js               pure rules engine — no DOM, no network
js/puzzles.js             built-in puzzle content (data only)
js/storage.js             localStorage settings persistence
js/room.js                PeerJS room wrapper, adapted from icon-guess-the-word
js/main.js                DOM wiring, redaction, render, networking glue
vendor/peerjs.min.js     vendored PeerJS client (no CDN dependency at runtime)
images/cards/*.png       puzzle card images, opaque filenames (see Decision #4)
images/icons/*.png       AI-generated illustrations with no text, composited
                          into cards by name (clock, fish, pouch, road-fork —
                          see Decision #8); not opaque, since these never
                          identify a specific answer on their own
tests/game.test.mjs      node --test unit tests for js/game.js
.github/workflows/deploy.yml   test job → GitHub Pages deploy job
```

### Networking model (Host + Display, per US-3)

Identical pattern to `icon-guess-the-word` and `word-scramble`:
host-authoritative, full-snapshot broadcast, no per-connection roles
(Display never sends an action), PeerJS over the public broker. `js/room.js`
is copied over near-verbatim with a distinct ID prefix (`rebus-room-`) so
rooms from different games never collide on the shared broker.

- No timer, so no clock-offset sync is needed at all — this project's
  `main.js` is simpler than every timer-carrying sibling's.

## Decisions

1. **Puzzle format corrected mid-build, before anything shipped.** The
   initial reading of the brief ("Rebus cards", "flash card game") produced
   an icon-*pair* design — two illustrated objects combining into a
   compound word, e.g. sun + flower = SUNFLOWER — and a first icon
   (`sun.png`) was generated in that style. The user then shared a photo of
   a real rebus puzzle sheet: these are **typographic** puzzles (word
   position, size, repetition, a visual break, numbers/letters standing in
   for their sound), not picture-pairs. The icon-pair content was discarded
   before any puzzle data was finalized; every puzzle in the shipped v1 set
   is the typographic style. Recorded here rather than silently erased from
   history because it's a real example of catching a misunderstanding from
   a reference example instead of guessing further from a text brief alone.
2. **Card images are generated two ways, chosen per puzzle.** The user
   initially asked for AI-generated images to match the reference sheet's
   exact look. AI image generation is unreliable at exact text, though — a
   real risk for puzzles that are *entirely* text — so every generated card
   was manually reviewed against its intended text before being kept (see
   `js/puzzles.js`'s `description` field, which records the literal
   generation prompt used, `ai:`-prefixed). Partway through, it became
   clear that pure-text, pure-geometric-layout cards (two words stacked, a
   word repeated N times, letters placed along a diagonal) could be
   rendered **locally** via a small HTML/CSS template and a headless-browser
   screenshot — zero risk of misspelling, near-instant, no generation cost.
   Cards needing an actual illustrated element would still need real image
   generation; none of the final 14 puzzles turned out to need one, so the
   set ended up split 7 AI-generated / 7 locally-rendered. Both paths are
   recorded in `description` (`ai:` vs `html:` prefix) so any card can be
   regenerated the same way it was made, or switched from one path to the
   other, without reconstructing the spec from scratch.
3. **`puzzles.js`'s `id` is descriptive; `image` is not.** Early versions
   used the same descriptive slug for both (`understand` → `images/cards/
   understand.png`). `id` never leaves the source code, so it stays
   readable. `image` is sent to the Display over the network — see the next
   decision.
4. **Puzzle image filenames must be answer-independent — caught as a real
   bug, not designed in up front.** The first networking implementation
   correctly stripped `answer` (and, after a second look, the descriptive
   `id`) from the Host's broadcast payload, but still pointed the Display
   at `images/cards/understand.png` — the filename itself spelled out the
   answer, which a Display-side player could read straight off the image
   URL. Caught by an automated playtest that scanned the Display's DOM for
   every known answer slug (see tasks.md Phase 5) after redacting `id`
   surfaced the same class of leak in a different field. Fixed by renaming
   every card image to an opaque `card-NN.png` and updating `puzzles.js`
   accordingly — `image` is the only puzzle field that ever reaches a
   non-Host client, and it now carries zero information about the answer.
5. **No category selection UI in v1.** With only one built-in puzzle set
   (22 puzzles, all "classic typographic rebus" style), a category picker
   would be a screen with nothing to actually choose — deferred until
   there's a second puzzle set worth choosing between (see Non-goals +
   tasks.md Open backlog).
6. **Own visual palette, not reused from a sibling.** A warm puzzle-card
   look (deep teal background, cream card surfaces, coral vs. gold team
   colors) — distinct from Emoji Says' purple/yellow and Word Scramble's
   felt-green/gold, so `gondoit.work`'s portfolio (if this game is added
   there later) reads as a family of distinct games, not reskins of one
   template.
7. **No timer, no hints, no bidding tokens — the simplest of the three
   frameworks the concept named.** The user's brief offered three distinct
   mechanical frameworks (Real-Time Race w/ handicap, Bidding War w/ reveal
   tokens, Combo Builder w/ card hands + modifiers) and asked for something
   "simpler for 2 teams." This build takes the *shape* of the Real-Time
   Race (flip a card, shout, judge awards it) and drops even its one added
   twist (the handicap penalty) — with only 2 teams instead of 3-8, a
   single word-genius dominating isn't the same runaway-leader problem the
   handicap was designed to solve, so it would add a rule with no payoff.
8. **Illustrated cards use a hybrid pipeline: AI generates the icon alone,
   HTML composites the text.** Several strong puzzle ideas (HIGH NOON,
   FISH OUT OF WATER, ZIP IT, CROSSROADS) need a real illustrated object —
   no CSS trick draws a recognizable clock or fish. Rather than let the AI
   generate the full card (Decision #2's original `ai:` path, which
   reintroduces the exact-text risk that path was built to avoid for
   typography-only cards), the AI generates *only* the object, with no
   text anywhere in the prompt, saved to `images/icons/`. The exact answer
   text is then placed by the same HTML/CSS + headless-screenshot pipeline
   used for `html:` cards, composited with the icon via a plain `<img>`
   tag. This keeps the "AI is unreliable at exact text" mitigation intact
   while still getting real illustrations. Recorded as a third
   `description` prefix, `ai-icon:`, naming which icon file it composites
   and where the text sits relative to it.
9. **A fourth source type, `crop:`, for owner-supplied reference sheets
   that are already finished puzzle art.** The first two reference photos
   in this project were hand-drawn/photographed puzzle sheets used as a
   *spec* to redraw from (Decisions #1, #2). The third and fourth
   reference images were different in kind: pre-made digital grids of
   already-polished individual puzzle cards (safe+lock icons, real tire
   photos, emoji), with the owner's explicit instruction to "just crop the
   images" rather than reproduce them. `description` for these records
   `crop: <what's in the image> — from the owner-supplied reference sheet
   (<filename>)` instead of a prompt or layout spec, since there's nothing
   to regenerate from — the source of truth is the original uploaded
   image, not a reconstructable recipe. This is a deliberate asymmetry
   with every other card in this file: if a `crop:` card ever needs
   fixing, it means re-cropping from the original reference image (kept
   in the conversation history, not this repo), not editing a prompt.

10. **Timer and letter hints, added post-launch, mirror
    `icon-guess-the-word`'s exact shape rather than inventing a new one.**
    v1 shipped deliberately without either (see the header comment in the
    original `js/game.js` and spec.md's Non-goals) — the "Call-out Race"
    framework this game is built on doesn't need them to function. The
    owner asked for them anyway once the deck had grown large enough that
    some rounds run long. Rather than design something bespoke, this
    reuses the sibling project's proven pattern wholesale:
    - **Hints**: `revealLetter(state, rng)` picks one *random* remaining
      blank letter (not left-to-right — sequential reveal makes the answer
      too predictable), recorded as `puzzle.revealedIndexes`. A
      `maskedAnswer(puzzle)` helper turns that into a `{char, isSpace}[]`
      the UI renders as letter tiles — spaces always visible, letters only
      once revealed. This is the same redaction shape as the puzzle image
      itself (Decision #4's filename discipline): the Display must never
      receive an unrevealed letter over the wire, so `redactState` in
      `js/main.js` sends `masked`, never the raw `answer`.
    - **Timer**: per-puzzle, optional (`timerSeconds: 0` = disabled
      entirely, no UI shown). The Host explicitly starts the countdown
      per round (`startTimer`) rather than it auto-starting on deal — a
      round shouldn't start ticking while a team is still parsing the
      *previous* round's outcome. Expiry (`checkTimerExpired`, polled
      every 250ms from the Host's own clock only) auto-skips with no score
      change and leaves the new puzzle's timer paused, same as a manual
      Skip. This required restoring the clock-offset sync pattern
      (`hostNow: Date.now()` broadcast alongside every state snapshot,
      `clockOffset = hostNow - Date.now()` computed once on the Display)
      that v1 had stripped out entirely — ticks are never pushed over the
      network; both sides just repaint from their own clock plus a fixed
      offset, using an absolute deadline so drift can't accumulate.
    - Every existing state transition (award, skip, or timeout) routes
      through the same `dealPuzzle` function, so a fresh puzzle always
      starts with `revealedIndexes: []` and `timerStatus: 'paused'` — no
      code path can leak a hint or a running clock into the next round.

11. **Category selection, added post-launch, reverses Decision #5 once the
    deck had grown past 100 cards.** v1 explicitly deferred this (a picker
    wasn't worth it for 14-28 cards); by the time the built-in set reached
    111, mixing every card together stopped being the only reasonable
    default. Rather than add custom/uploadable categories (still out of
    scope — see spec.md Non-goals), every puzzle in `puzzles.js` got a
    single `category` field, assigned by a deterministic rule rather than
    per-card judgment calls, checked in this order: `'tagalog'` for a
    Tagalog-language answer, `'picture'` for any remaining `ai-icon:` card
    (built around a composited illustration), `'phrase'` for a remaining
    multi-word answer, `'wordplay'` for a remaining single-word/compound
    answer. `'tagalog'` is checked first specifically because the two
    Tagalog cards (HATING KAPATID, HABA NG BUHOK) are also multi-word and
    would otherwise fall into `'phrase'` — a language distinction should
    win over an English-only word-count heuristic. This produced a 35/45/
    29/2 split, and means a new card's category never needs deciding by
    hand — it falls out of choices already being made (icon or not, one
    word or several, Tagalog or English). Filtering is a new pure
    function, `filterByCategory` in `js/storage.js`, applied in
    `js/main.js` *before* `filterUnusedPuzzles` — so "used" tracking and
    category filtering compose independently, and `game.js` itself needs
    no changes (it already just shuffles whatever pool it's handed). The
    Setup screen renders one checkbox per `CATEGORIES` entry (multi-select,
    not a single dropdown — the Host asked to be able to combine
    categories, e.g. Tagalog + Picture Clues together), and
    `settings.categories` (an id array, default `[]` meaning "every
    category") persists the Host's last choice the same way target score
    or timer length do.

12. **Host-only answer blur, added post-launch alongside category
    selection.** The card image was already dealt blurred with a tap-to-
    reveal (Decision from v1's `revealImage`), but the "Answer" text panel
    above it was always shown in the clear. The Host asked for the same
    treatment there. This is deliberately *not* wired through `game.js` or
    the network the way `imageRevealed` is — the Display never receives
    the raw answer regardless (see `redactState` in `js/main.js`), so
    there's no shared state to keep in sync, just a per-round local UI
    flag (`hostAnswerRevealed` in `js/main.js`) that resets to `false`
    every time a fresh puzzle is dealt (start game, award, skip, timer
    expiry, play again) and flips to `true` on tap. Reuses the exact same
    `.reveal-hint` overlay markup/CSS the card image uses, just scoped to
    `#host-answer-card` instead of `#host-card-wrap`.

## Changelog

- **v1** (2026-07-12): Initial build — 14 classic typographic rebus
  puzzles (7 AI-generated, 7 locally HTML-rendered), single built-in set,
  Host + Display over PeerJS, GitHub Pages deploy, SDD docs. Corrected
  mid-build from an initial icon-pair design after the user shared
  reference examples (Decision #1); fixed an answer-leaking filename bug
  caught by an automated Display-DOM scan (Decision #4).
- **v1.1** (2026-07-12): Added 8 more puzzles (22 total) from a user-
  supplied CSV of additional rebus ideas, all rendered locally (`html:`)
  since every one was pure typography/layout with no illustrated element:
  BACKSTAB (word spelled backward), FADE OUT (per-letter opacity
  gradient), ONCE IN A BLUE MOON (color as the trick — the one card that
  isn't black-on-white, since blue is load-bearing here, not decoration),
  SMALL ISSUE (tiny text in a big box), WINDOWPANE (word across a 4-pane
  window grid), COVER TO COVER (word repeated at the top and bottom edge),
  CUT PRICE (word with a line struck through it), BIG DEAL (word blown up
  to fill the card). Of the ~50 ideas in the source CSV, roughly 40 were
  passed over for having more than one plausible reading (e.g. two
  candidate answers listed for the same card), needing an illustrated
  icon this project has no reuse-library for (see Decision #3 discussion —
  a single-use icon isn't worth generating for one card), or — caught
  during this round specifically — a repetition trick that doesn't
  actually decode to its claimed answer ("GIVE" x4 was dropped: unlike
  "GET IT" x4 → FOUR-GET-IT, there's no phonetic reading of four GIVEs
  that produces "up").
- **v1.2** (2026-07-12): Added 6 more puzzles (28 total, up from v1.1's 22)
  directly requested by the user. SHUTDOWN ("SHUT"/"DOWN" stacked) was
  built first but removed immediately at the user's request as
  "incorrect," before it was ever counted — the 6 that shipped are
  STEPFATHER and STEP DOWN (both use a new CSS clip-path staircase
  silhouette — `.staircase-up`/`.staircase-down` in the shared card
  template — ascending under "FATHER" for one, descending toward a
  lower-right "DOWN" for the other; STEP DOWN was this session's own
  extension of the user's "ladder from stepfather" instruction, reusing
  the same graphic with different text/position rather than a second
  unrelated puzzle), and — introducing the `ai-icon:` hybrid (Decision
  #8) — HIGH NOON, FISH OUT OF WATER, ZIP IT, and CROSSROADS. A fifth
  `ai-icon:` candidate, AROUND THE WORLD (a ribbon/bow icon), was
  generated but dropped: overlapping the bow with the word "WORLD"
  obscured the text, and stacking them instead (bow above word) didn't
  read as "around" clearly enough to keep. Also removed the unused
  `images/icons/ribbon.png` since nothing references it.
- **v1.3** (2026-07-12): Five direct owner revisions to cards from v1.2,
  each swapping a weaker mechanism for a clearer one:
  - **FISH OUT OF WATER**: was "DISH" text + fish (a pun on the sound of
    "dish"/"fish", not actually depicting the idiom). Now a black-outlined
    oval labeled "WATER" with the fish clearly separated outside it —
    depicts the idiom directly instead of punning around it.
  - **ZIP IT**: was the pouch icon + the word "ZIP" (redundant — the
    zippered pouch already reads as "zip"). Now pouch + "IT", so the icon
    and text together spell the full two-word answer instead of
    overlapping in meaning.
  - **FADE OUT**: was "PROGRAM" fading letter-by-letter (arbitrary word
    choice, answer wasn't legible from the card itself). Now "OUT"
    repeated 5 times, each copy more transparent — the literal word in the
    answer is what's fading, so the card reads correctly on its own.
  - **BACKSTAB**: was the letters "EFINK" alone (KNIFE backward) — correct
    but a pure decode puzzle with no image at all, out of step with the
    rest of the illustrated set. Generated a new `images/icons/knife.png`
    (background chroma-keyed to transparent after generation, since the
    prompt only specified a white background, not transparency — a
    process note worth remembering for future icon generations) and
    composited it stabbing into the "K" of "BACK".
  - **BIG DEAL**: was one giant "DEAL" filling the card — "big" was
    implied only by comparison to the *other* cards, not shown on the
    card itself. Now a small "DEAL" with an SVG arrow pointing at a much
    larger "DEAL", so the comparison (and which one is "big") is on the
    card.
  - **CROSSROADS**: was road-fork icon + "ROADS" (redundant — the fork
    already reads as roads crossing). Now a large "X" (reads as "cross")
    above the plain road-fork icon (reads as "road(s)"), so icon and text
    each carry half the answer instead of both carrying "roads".
  All 5 re-verified visually and re-tested (13/13, live Playwright
  playtest) before committing.
- **v1.4** (2026-07-12): Two more owner revisions, both moving from
  `ai-icon:` to plain `html:` (no illustration needed after all):
  - **CROSSROADS**: was "X" above the plain road-fork icon. Now a large
    red "X" overlaid directly on top of the word "ROADS" — closer to the
    classic rebus convention of a mark literally crossing out/through a
    word, and one less asset to maintain.
  - **HIGH NOON**: was the clock icon + "NOON" below it. Now "NOON"
    repeated 6 times in one column, each line smaller than the last (150px
    down to 36px) — a tall, shrinking stack read as an "inverse pyramid":
    the height and the big-to-small taper both carry "HIGH", "NOON" is
    the literal repeated word.
  Neither card uses an icon anymore, so `images/icons/clock.png` and
  `images/icons/road-fork.png` are now unused — deleted both, leaving only
  `fish.png`, `knife.png`, `pouch.png` (the 3 icons actually referenced by
  a puzzle). Re-verified: 13/13 tests, live Playwright playtest, every
  puzzle image confirmed present.
- **v1.5** (2026-07-12): Went back through the original 12-card reference
  photo (the one that corrected this project's whole approach in v1 —
  see Decision #1) and found 3 of its puzzles hadn't been built at all,
  plus one built in simplified form. Added all 4 as new puzzles (32
  total): TRAVEL OVERSEAS ("TRAVEL" over a line over 7 "C"s — spelled
  "seas" — matches the reference photo's exact layout), 3D MOVIE (three
  "D"s + "MOVIE"), TRY TO UNDERSTAND ("TRY TO" above the same I-over-STAND
  fraction the plain UNDERSTAND card uses — kept as an additional puzzle
  rather than replacing UNDERSTAND, since both are legitimate answers and
  having both isn't confusing in a shuffled deck), and ONCE UPON A TIME
  ("ONCE" + a clock icon — required regenerating `images/icons/clock.png`,
  since v1.4 had deleted the original as unused before this need came up).
  Two of the original photo's 12 cards remain deliberately unbuilt: the
  blurry "M1Y L1I1F1E" (illegible even in the source photo) and the
  "EYE / eye" / "POT" examples (no confident unambiguous reading found) —
  same judgment call as v1, re-confirmed rather than revisited.
- **v1.6** (2026-07-12): Corrected TRY TO UNDERSTAND's layout — v1.5 had
  paraphrased it as "TRY TO" stacked above the same I/STAND fraction the
  plain UNDERSTAND card uses, substituting a literal "TO" for the
  original's "2" homophone. The owner caught that this drifted from the
  reference photo. Rebuilt to match it exactly: "Try" on the left, and a
  fraction to its right with "stand" as the numerator and "2" as the
  denominator — restores the original's "2" = "to" homophone instead of
  spelling it out.
- **v1.7** (2026-07-12): Two more owner-supplied reference sheets, 21
  puzzles added (59 total) — see Decision #9 for the new "cropped, not
  regenerated" source path this introduced. From the first sheet (12
  cards, 8 duplicating existing answers, kept the existing versions per
  owner direction): THREE BLIND MICE, TOUCHDOWN, SIX FEET UNDER GROUND
  (this resolves the exact CSV entry from v1.1 that had to be dropped for
  being missing a "SIX" — the reference sheet's "FEEEET" turns out to be
  exactly 6 characters, the trick v1.1 didn't have enough information to
  reconstruct), WIDE-EYED, OLD AGE, A WALK IN THE PARK, and a second,
  successful attempt at AROUND THE WORLD (circular arrows around the word,
  succeeding where the v1.4 ribbon-icon attempt was dropped as unclear —
  kept as `around-the-world-v2`, a second card with the same answer as
  the dropped attempt would have had, which is fine since the first one
  was never shipped). From the second sheet (15 cards, 14 with owner-
  supplied answers), added all but one: the one card with no confident
  match (a 2x2 grid of the word "LORD") was skipped rather than guessed
  at, even though the owner's stated preference for this batch was to
  trust the answer key over full personal verification — an unlabeled
  card is a different situation from a labeled-but-unverified one. The
  other 14 include one inferred rather than owner-labeled: "R" + a dash +
  an OK hand-gesture emoji, read as ARE YOU OK — the one card missing from
  the owner's 14-item answer list for that sheet, apparently because it
  was self-evident enough that the owner asked it conversationally
  ("Are you okay?") instead of listing it.
- **v1.8** (2026-07-12): Added optional per-puzzle timer and letter hints
  (Decision #10), both off by default and configured per-room on the
  setup screen. `js/game.js` gained `revealLetter`, `maskedAnswer`,
  `startTimer`, `checkTimerExpired`, `timerRemainingMs`, and a
  `TIMER_STATUS` enum, plus 13 new unit tests (26/26 total). `js/room.js`
  had its `hostNow` clock-offset parameter restored (present in the
  sibling games, stripped from this project's original no-timer v1).
  `js/main.js`'s `redactState` now also sends `hintsEnabled`,
  `timerSeconds`, `timerStatus`, `timerDeadline` (all non-secret) and a
  `masked` letter array per puzzle — still never the raw `answer` or the
  descriptive `id`. New UI: a Letter Hints checkbox and Time-per-Puzzle
  dropdown on setup; a Reveal-a-Letter button, timer readout, and letter
  tiles on both the Host panel and the Display. Verified end-to-end with
  a 2-tab Playwright playtest: hint reveals and timer countdown both sync
  correctly Host→Display, the answer never appears in the Display DOM,
  and the timer/tiles reset to paused/blank on every new puzzle dealt.
- **v1.9** (2026-07-12):
  - **CROSSROADS**: Improved the depiction (card-28.png) to use a classic intersecting words layout instead of the red "X" overlaid on "ROADS". It now displays the word "ROADS" twice (horizontally and vertically) intersecting at the central letter "A". Updated `js/puzzles.js` description to match.
  - **Cards 39-59**: Cleaned, scaled, centered, and recomposited all 21 raw card crops from the reference sheets into the standard 800x800 template with a sharp 6px black border, removing any messy photo margins/clipped edges. Updated comments in `js/puzzles.js` to match.
  - **Recreated Card 48 (BALLPARK FIGURE)**: Sourced a clean AI-generated icon of spectacles (glasses/specs) at `images/icons/spectacles.png` and composited it above the word "BALL" to generate a brand new card-48.png, resolving a severe cropping issue with the original photo card. Updated `js/puzzles.js` description to match.
  - **Recreated Card 53 (BRIDGE THE GAP)**: Sourced a clean AI-generated icon of a bridge at `images/icons/bridge.png` and composited it via HTML/Python bridging a physical gap between the words "THE" and "GAP" on top of two horizontal ground lines, providing a highly visual and intuitive depiction of the phrase. Updated `js/puzzles.js` description to match.
  - **Recreated Card 47 (MIND YOUR OWN BUSINESS)**: Re-rendered the card using the standard clean typographic layout displaying "BUSINESS" centered with a large red "X" overlaid on the letter "I" (meaning "minding" your own "I" in "BUSINESS"). Updated `js/puzzles.js` description to match.
  - **Recreated Card 50 (FORECLOSED)**: Re-rendered the card using the standard typographic layout, displaying the word "CLOSED" 4 times in a vertical column ("four closed" = "foreclosed"). Updated `js/puzzles.js` description to match.
  - **Recreated Card 59 (TEA-TIME)**: Re-rendered the card by placing a large letter "T" (representing "tea") next to the standard black clock icon (representing "time") to cleanly and visually depict "TEA-TIME". Updated `js/puzzles.js` description to match.
  - **Recreated Card 49 (A PENNY FOR YOUR THOUGHTS)**: Sourced a clean AI-generated icon of a thought bubble at `images/icons/thought-bubble.png` and composited the letter "A" next to it, with the word "PENNY" centered inside the thought bubble to represent "A penny for your thoughts". Updated `js/puzzles.js` description to match.
  - **Recreated Card 58 (SCAREDY-CAT)**: Sourced a clean AI-generated icon of a scaredy-cat (frightened arched cat silhouette) at `images/icons/scaredy-cat.png` and composited the letter "S" next to it to visually represent "SCAREDY-CAT". Updated `js/puzzles.js` description to match.
  - **9 Improved Cards**:
    - **HAND OVER FIST** (`card-57.png`): Sourced clean icons of a hand and a fist, and aligned the hand icon vertically above the fist icon.
    - **AROUND THE WORLD** (`card-45.png`): Sourced a clean globe and arrows icon (`globe-arrows.png`) and composited it centered on the card.
    - **I SEE YOU** (`card-37.png`): Sourced a clean eye icon, and aligned `[Eye Icon]` + `C` + `U` horizontally.
    - **ROUNDTOWN** (`card-51.png`): Re-rendered with the word "TOWN" centered inside a clean black circle.
    - **ARE YOU OK** (`card-46.png`): Sourced a clean OK hand icon, and aligned `R` + `U` + `[OK Hand Icon]` horizontally.
    - **BALLPARK FIGURE** (`card-48.png`): Recreated to display a clean baseball diamond icon with a large number "9" centered inside it.
    - **A CENTURY OLD** (`card-56.png`): Recreated with `A` + `100` + `OLD` stacked vertically.
    - **COVER TO COVER** (`card-20.png`): Recreated with `COVER` + `TO` + `COVER` stacked vertically.
    - **HAND SHAKE DEAL** (`card-55.png`): Sourced a clean handshake icon and placed it centered above the word "DEAL".
  - **22 New Card Additions** (`card-60.png` to `card-81.png`): Added 22 new rebus puzzles to the game database, including:
    - **Tagalog wordplay/idiom crops** decoded from the "Rebus new pics" folder: HATING KAPATID (`card-60`), HABA NG BUHOK (`card-61`), ADVICE (`card-62`), FORGIVE AND FORGET (`card-63`), BIRD'S-EYE VIEW (`card-64` with custom red bird icon), FIRST AID (`card-65`), MISUNDERSTAND (`card-66` with a girl restroom sign representing "MISS" under "STAND"), SCRAMBLED EGGS (`card-67`), 24/7 (`card-68` with 24s in a circle), FOR ONCE IN MY LIFE (`card-69`), and SIT-UPS (`card-70`).
    - **New requested English phrases**: ON SECOND THOUGHT (`card-71`), SIXTH SENSE (`card-72`), SHOP LIFT (`card-73`), KEEP YOUR EYES ON THE BALL (`card-74`), FORTUNATE (`card-75` with fish icon), DISCOUNT (`card-76`), TRIPOD (`card-77`), ELBOW (`card-78`), METAPHOR (`card-79`), SUMMARY (`card-80`), and LOOK ME IN THE EYE (`card-81` with eye icon containing "ME").
  - **TRIPOD & ELBOW Layout Adjustments**:
    - **TRIPOD** (`card-77.png`): Redesigned to stack the word `POD` in 3 rows vertically, resolving crowding.
    - **ELBOW** (`card-78.png`): Redesigned the letters `B O W` to share the corner letter `O` and form a capital `L` shape (`B` vertically above `O`, `W` horizontally to the right of `O`).
  - **4 Additional Card Additions** (`card-82.png` to `card-85.png`):
    - **TIME'S UP** (`card-82.png`): Centered the word "TIMES" with an upward-pointing black arrow next to it.
    - **SPACESHIP** (`card-83.png`): Spaced the letters in the word "SHIP" far apart as "S  H  I  P".
    - **COMFORTABLE** (`card-84.png`): Placed the word "COME" next to the word "table" repeated 4 times vertically ("Come for table").
    - **ONCE IN A BLUE MOON** (`card-85.png`): Centered "MOONCEON" where the letters M-O-O-N at the outer boundaries are blue and the letters C-E in the center are black ("ONCE" inside a blue "MOON").
  - **Refinements to 5 Cards**:
    - **MIND YOUR OWN BUSINESS** (`card-47.png`): Re-rendered with all words stacked vertically: "MIND", "YOUR", "OWN", and "BUSINESS" (with a large red "X" overlaid on the letter "I").
    - **COVER TO COVER** (`card-20.png`): Sourced a clean vector book cover icon (`book-cover.png`) representing the back of an open book cover, and wrote "COVER" on both the left and right cover halves.
    - **BIRD'S-EYE VIEW** (`card-64.png`): Centered the red bird icon and removed the external "VIEW" text, keeping only the tiny "VIEW" inside the bird's eye.
    - **SHOPLIFT** (`card-73.png`): Sourced a clean vector crane hook icon (`crane.png`) and composited it at the top, lifting the word "SHOP" below it via two supporting rope lines.
    - **ON SECOND THOUGHT** (`card-71.png`): Replaced the red pointer arrow with a clean red circle drawn around the second "THOUGHT" word.
  - **FRIENDSHIP Card Addition** (`card-86.png`):
    - Sourced a clean vector ship icon (`ship.png`) and composited it next to the word "FRIEND" horizontally centered on the card. Added the puzzle to the database.
  - **ICECUBE Card Addition** (`card-87.png`):
    - Rendered the word "ICE" with a superscript "3" next to it (meaning "ICE cubed" = "ICECUBE"). Added the puzzle to the database.
  - **4 More Card Additions** (`card-88.png` to `card-91.png`):
    - **EYE SHADOW** (`card-88.png`): Rendered the eye outline icon with a duplicate offset grey shadow behind it.
    - **IN BETWEEN JOBS** (`card-89.png`): Aligned "JOB  IN  JOB" with the middle "IN" colored red.
    - **FOR INSTANCE** (`card-90.png`): Rendered "STA4NCE" with the number "4" colored red.
    - **DOWNLOAD** (`card-91.png`): Aligned "DOWN" above a horizontal divider line and "LOAD" below it. Added all to the database.
  - **SCREWDRIVER Card Addition** (`card-92.png`):
    - Sourced clean vector icons of a car (`car.png`) and a screw (`screw.png`). Composited a red screw inside the front window (driver's side) of a black car silhouette. Added to the database.
  - **BIG FISH IN A SMALL POND Card Addition** (`card-93.png`):
    - Rendered the text "poFISHnd" with "po" and "nd" small and lowercase, and "FISH" large and uppercase. Added to the database.
  - **LONGTERM Card Addition** (`card-94.png`):
    - Rendered an exceptionally tall letter "L" with the word "term" positioned at its lower-left corner in red. Added the database.
  - **3 Final Card Additions** (`card-95.png` to `card-97.png`):
    - **FOOLING AROUND** (`card-95.png`): Rendered the word "FOOLING" inside a circular looping arrow drawn mathematically using Pillow.
    - **TOO BIG TO IGNORE** (`card-96.png`): Aligned "TOO BIG TO IGNORE" horizontally with "BIG" in a massive font and "IGNORE" in a tiny font.
    - **NO SECOND CHANCE** (`card-97.png`): Stacked "CHANCE" twice vertically, with the second instance crossed out by a large red X. Added all to the database.
  - **HAYSTACK Card Addition** (`card-97.png`):
    - Stacked the word "HAY" 4 times vertically (representing a stack of HAY = "HAYSTACK"). Added to the database.
  - **SWEET TOOTH Card Addition** (`card-98.png`):
    - Rendered the word "TOOTH" with the double "O" replaced by two cute pink wrapped candy silhouettes. Added to the database.
  - **FALL IN LINE Card Addition** (`card-99.png`):
    - Rendered the word "FALL" in red positioned inside the split word "LINE" ("LI FALL NE"). Added to the database.
  - **TOUCHDOWN Card Addition** (`card-100.png`):
    - Rendered the word "TOUCH" positioned at the very bottom of the card (lowest part). Added to the database.
- **v1.10** (2026-07-12): Fixed a real bug reported by the owner —
  "Start Timer and Reveal a Letter don't work" — plus a UX redesign of
  the same control. Root cause: `.timer-wrap` sets `display: flex`
  unconditionally, which has the same CSS specificity as the browser's
  own `[hidden] → display:none` default and comes later in the cascade,
  so it silently won — `#host-timer-wrap` (with a stale hardcoded "30"
  placeholder baked into the HTML) rendered even when the Host never
  configured a timer, and tapping the always-visible Start Timer button
  was a harmless no-op against `timerSeconds: 0`. Fixed two ways: added
  a global `[hidden] { display: none !important; }` rule so no future
  class can out-rank the attribute, and — per owner direction ("just
  disable the start button and put infinite if there is no timer") —
  redesigned the control to never hide at all: the timer readout always
  shows (an infinity glyph when no timer is configured) and Start Timer
  is `disabled` rather than a silent no-op in that state. Also added
  `.btn:disabled` styling, since nothing used the `disabled` attribute
  before this.
- **v1.11** (2026-07-12): Added a tap-to-reveal blur on the puzzle image,
  per owner request ("add a blur if not yet started, or host can tap the
  image to reveal"). Every dealt puzzle now starts with
  `puzzle.imageRevealed: false`; a new `revealImage(state)` in
  `js/game.js` (same no-op-outside-playing/no-op-once-already-done
  convention as `revealLetter`/`startTimer`) flips it to `true`. The
  Host taps `#host-card-wrap` to reveal — this reveals for the Display
  too, since `imageRevealed` rides along in the normal state broadcast
  rather than needing a separate message. The answer *text* on the
  Host's own screen was never blurred or gated by this — only the image,
  which is the part a Display-side player could otherwise see early.
  `.card-wrap.blurred .rebus-card-image` applies `blur(22px)
  brightness(0.75)`, with a `.reveal-hint` overlay ("👆 Tap to reveal" on
  Host, "🙈 Get ready…" on Display, non-interactive on the Display side
  since it never sends actions). Resets to blurred on every new puzzle
  dealt, same as hints/timer. 4 new unit tests (30/30 total).
