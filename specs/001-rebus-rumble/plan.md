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
