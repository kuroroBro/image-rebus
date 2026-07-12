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
// Cards come from three sources, all recorded in `description`:
//   - `ai:` prefix — the whole card generated via the image-gen skill
//     (text and all); the text after the prefix is the exact prompt used.
//     Every AI-generated card was manually checked against its intended
//     text before being kept.
//   - `html:` prefix — rendered locally from HTML/CSS via a headless
//     browser screenshot (see the shared template these all use, kept in
//     this project's history — a plain white 800x800 card, 6px black
//     border, bold Arial/Helvetica, centered content). Used for every card
//     that's pure text/geometry with no illustration, since that's cheaper
//     and guarantees correct spelling.
//   - `ai-icon:` prefix — a hybrid: the illustrated object alone (no text)
//     is AI-generated and saved to `images/icons/`, then composited with
//     the exact answer text via the same HTML/CSS + screenshot pipeline as
//     `html:` cards. This gets the reach of AI illustration (a clock, a
//     fish, a zippered pouch) with zero text-spelling risk, since the text
//     itself is never AI-generated. See plan.md Decision #8.

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
  {
    id: 'backstab',
    answer: 'BACKSTAB',
    image: 'images/cards/card-15.png',
    description: 'html: Just the letters "EFINK" (KNIFE spelled backward), large, centered.',
  },
  {
    id: 'fade-out',
    answer: 'FADE OUT',
    image: 'images/cards/card-16.png',
    description: 'html: The word "PROGRAM" in one line, each letter progressively more transparent left to right, the last letter barely visible (opacity 1.0 down to about 0.15 across the 7 letters).',
  },
  {
    id: 'once-in-a-blue-moon',
    answer: 'ONCE IN A BLUE MOON',
    image: 'images/cards/card-17.png',
    description: 'html: A solid blue (#2563eb) card background (instead of the usual white) with the word "MOON" in large white text, centered. Still has the usual black border.',
  },
  {
    id: 'small-issue',
    answer: 'SMALL ISSUE',
    image: 'images/cards/card-18.png',
    description: 'html: A large square black outline box centered on the card, with the lowercase word "issue" in small text centered inside it.',
  },
  {
    id: 'windowpane',
    answer: 'WINDOWPANE',
    image: 'images/cards/card-19.png',
    description: 'html: A large square divided into a 2x2 grid by one vertical and one horizontal black line (like a 4-pane window), with the word "PAIN" centered across the middle of the grid.',
  },
  {
    id: 'cover-to-cover',
    answer: 'COVER TO COVER',
    image: 'images/cards/card-20.png',
    description: 'html: The word "COVER" near the top edge of the card, and the word "COVER" again near the bottom edge, with empty space between them.',
  },
  {
    id: 'cut-price',
    answer: 'CUT PRICE',
    image: 'images/cards/card-21.png',
    description: 'html: The word "PRICE" large and centered, with a red horizontal line cutting through the middle of it at a slight angle, like a strikethrough.',
  },
  {
    id: 'big-deal',
    answer: 'BIG DEAL',
    image: 'images/cards/card-22.png',
    description: 'html: Just the word "DEAL" in an enormous font size, filling almost the entire card edge to edge.',
  },
  {
    id: 'stepfather',
    answer: 'STEPFATHER',
    image: 'images/cards/card-23.png',
    description: 'html: The word "FATHER" centered near the top, with a black ascending-staircase silhouette (5 steps, CSS clip-path) below it.',
  },
  {
    id: 'step-down',
    answer: 'STEP DOWN',
    image: 'images/cards/card-24.png',
    description: 'html: The same staircase silhouette as stepfather, mirrored to descend left-to-right, with the word "DOWN" positioned in the lower-right corner near the bottom of the steps.',
  },
  {
    id: 'high-noon',
    answer: 'HIGH NOON',
    image: 'images/cards/card-25.png',
    description: 'ai-icon: images/icons/clock.png (a simple round analog clock face showing exactly 12 o\'clock) composited via html with the word "NOON" centered below it.',
  },
  {
    id: 'fish-out-of-water',
    answer: 'FISH OUT OF WATER',
    image: 'images/cards/card-26.png',
    description: 'ai-icon: images/icons/fish.png (a simple cartoon fish, side view) composited via html with the word "DISH" centered above it.',
  },
  {
    id: 'zip-it',
    answer: 'ZIP IT',
    image: 'images/cards/card-27.png',
    description: 'ai-icon: images/icons/pouch.png (a zippered pouch with a visible zipper) composited via html with the word "ZIP" centered below it.',
  },
  {
    id: 'crossroads',
    answer: 'CROSSROADS',
    image: 'images/cards/card-28.png',
    description: 'ai-icon: images/icons/road-fork.png (a road viewed from above splitting into two paths, a Y-fork) composited via html with the word "ROADS" centered below it.',
  },
];
