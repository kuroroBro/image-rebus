// Built-in rebus puzzle set for Rebus Rumble. Each puzzle is one classic
// typographic wordplay card — word position, repetition, size, a visual
// break, or a number/letter standing in for its sound — matching the
// traditional "rebus puzzle sheet" format (see specs/001-rebus-rumble for
// reference examples). `description` records exactly how to regenerate a
// card if it isn't up to par — see specs/001-rebus-rumble/plan.md
// Decision #2 (revised).
//
// `image` is deliberately an opaque filename (card-01.png, not
// understand.png) — the puzzle picture itself is public (that's the whole
// game), but the *filename* must not spell out the answer, or a Display-
// side player could read it straight off the image URL before anyone
// shouts anything. `id` stays descriptive since it's source code, never
// sent over the wire — see plan.md Decision #3.
//
// Cards come from two sources, both recorded in `description`:
//   - `ai:` prefix — generated via the image-gen skill; the text after the
//     prefix is the exact prompt used.
//   - `html:` prefix — rendered locally from HTML/CSS via a headless
//     browser screenshot (see the shared template these all use, kept in
//     this project's history — a plain white 800x800 card, 6px black
//     border, bold Arial/Helvetica, centered content). Used for every card
//     that's pure text with no illustration, since that's cheaper and
//     guarantees correct spelling — AI image generation is unreliable at
//     exact text. The text after the prefix is the layout description.

export const PUZZLES = [
  {
    id: 'understand',
    answer: 'UNDERSTAND',
    image: 'images/cards/card-01.png',
    description: 'ai: Show the word "I" centered near the top, a horizontal black line directly underneath it, then the word "STAND" centered directly underneath that line (I over STAND).',
  },
  {
    id: 'forget-it',
    answer: 'FORGET IT',
    image: 'images/cards/card-02.png',
    description: 'ai: Show the exact phrase "GET IT" repeated on 4 separate lines, stacked vertically, centered, all identical in size and font (four GET IT).',
  },
  {
    id: 'downtown',
    answer: 'DOWNTOWN',
    image: 'images/cards/card-03.png',
    description: 'ai: Show the letters "T", "O", "W", "N" stacked vertically one per line, top to bottom, centered, spelling TOWN reading downward (down + town).',
  },
  {
    id: 'top-secret',
    answer: 'TOP SECRET',
    image: 'images/cards/card-04.png',
    description: 'ai: Show the word "SECRET" repeated on 3 separate lines stacked vertically, all identical size, with a bold upward-pointing black arrow directly to the left of the topmost "SECRET" only.',
  },
  {
    id: 'breakfast',
    answer: 'BREAKFAST',
    image: 'images/cards/card-05.png',
    description: 'ai: Show the word "FAST" large and centered, visually split into two halves with a jagged crack/break running through the middle, the two halves slightly offset (break + fast).',
  },
  {
    id: 'head-over-heels',
    answer: 'HEAD OVER HEELS',
    image: 'images/cards/card-06.png',
    description: 'ai: Show the word "HEAD" centered in the upper half of the card, and the word "HEELS" centered in the lower half, with clear vertical space between them.',
  },
  {
    id: 'mind-over-matter',
    answer: 'MIND OVER MATTER',
    image: 'images/cards/card-07.png',
    description: 'ai: Show the word "MIND" centered in the upper half of the card, and the word "MATTER" centered in the lower half, with clear vertical space between them.',
  },
  {
    id: 'man-overboard',
    answer: 'MAN OVERBOARD',
    image: 'images/cards/card-08.png',
    description: 'html: "MAN" centered, gap, "BOARD" centered directly below it (same two-word-stack layout as head-over-heels / mind-over-matter).',
  },
  {
    id: 'reading-between-the-lines',
    answer: 'READING BETWEEN THE LINES',
    image: 'images/cards/card-09.png',
    description: 'html: A horizontal rule, then "READING" centered, then another horizontal rule directly below it (the word nestled between two ruled lines).',
  },
  {
    id: 'four-eyes',
    answer: 'FOUR EYES',
    image: 'images/cards/card-10.png',
    description: 'html: The lowercase letter "i" repeated 4 times in one row, comma-separated: "i, i, i, i" (four i\'s sound like four eyes).',
  },
  {
    id: 'before',
    answer: 'BEFORE',
    image: 'images/cards/card-11.png',
    description: 'html: Just "B4" (capital B, numeral 4, no space), large, centered.',
  },
  {
    id: 'later',
    answer: 'LATER',
    image: 'images/cards/card-12.png',
    description: 'html: Just "L8R" (capital L, numeral 8, capital R, no spaces), large, centered.',
  },
  {
    id: 'history-repeats-itself',
    answer: 'HISTORY REPEATS ITSELF',
    image: 'images/cards/card-13.png',
    description: 'html: The word "HISTORY" repeated on 6 lines, stacked vertically, filling most of the card top to bottom, all identical size.',
  },
  {
    id: 'downfall',
    answer: 'DOWNFALL',
    image: 'images/cards/card-14.png',
    description: 'html: The letters "F", "A", "L", "L" placed diagonally from upper-left to lower-right, each rotated a bit more than the last (0°, 18°, 38°, 60°), as if tumbling down the card.',
  },
];
