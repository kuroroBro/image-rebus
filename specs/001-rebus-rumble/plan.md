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
   (14 puzzles, all "classic typographic rebus" style), a category picker
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

## Changelog

- **v1** (2026-07-12): Initial build — 14 classic typographic rebus
  puzzles (7 AI-generated, 7 locally HTML-rendered), single built-in set,
  Host + Display over PeerJS, GitHub Pages deploy, SDD docs. Corrected
  mid-build from an initial icon-pair design after the user shared
  reference examples (Decision #1); fixed an answer-leaking filename bug
  caught by an automated Display-DOM scan (Decision #4).
