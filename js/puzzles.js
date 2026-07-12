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
    description: 'ai-icon: images/icons/knife.png (a simple flat dagger/knife, blade angled down-right, white background made transparent) composited via html: the word "BACK" large and centered, with the knife overlaid stabbing diagonally down into the "K".',
  },
  {
    id: 'fade-out',
    answer: 'FADE OUT',
    image: 'images/cards/card-16.png',
    description: 'html: The word "OUT" repeated on 5 lines stacked vertically, each line progressively more transparent top to bottom (opacity 1.0 down to about 0.08).',
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
    description: 'html: A small "DEAL" in the upper-left, an SVG arrow pointing diagonally down-right toward a much larger "DEAL" filling the lower-right — the arrow calls out which one is the "big" one.',
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
    description: 'html: The word "NOON" repeated on 6 lines, stacked vertically, each line progressively smaller top to bottom (font-size 150px down to 36px) — a tall inverse-pyramid shape (big/high down to small).',
  },
  {
    id: 'fish-out-of-water',
    answer: 'FISH OUT OF WATER',
    image: 'images/cards/card-26.png',
    description: 'ai-icon: images/icons/fish.png (a simple cartoon fish, side view) composited via html: a black-outlined oval labeled "WATER" in the upper-left, with the fish positioned clearly separate/outside it in the lower-right — the gap between them is the point.',
  },
  {
    id: 'zip-it',
    answer: 'ZIP IT',
    image: 'images/cards/card-27.png',
    description: 'ai-icon: images/icons/pouch.png (a zippered pouch with a visible zipper — the pouch/zipper itself reads as "zip") composited via html with the word "IT" centered below it.',
  },
  {
    id: 'crossroads',
    answer: 'CROSSROADS',
    image: 'images/cards/card-28.png',
    description: 'html: The word "ROADS" large and centered, with a large red "X" overlaid directly on top of it, centered — X reads as "cross", "ROADS" is the rest of the word, stated plainly instead of via an icon.',
  },
  {
    id: 'travel-overseas',
    answer: 'TRAVEL OVERSEAS',
    image: 'images/cards/card-29.png',
    description: 'html: The word "TRAVEL" centered, a horizontal line directly underneath it, then 7 letter "C"s (spaced out) centered underneath that line (TRAVEL over C\'s — "seas"). Matches the original reference photo exactly.',
  },
  {
    id: '3d-movie',
    answer: '3D MOVIE',
    image: 'images/cards/card-30.png',
    description: 'html: The letter "D" three times in a row with gaps between them, then the word "MOVIE" centered underneath (three D\'s + movie = 3D movie).',
  },
  {
    id: 'try-to-understand',
    answer: 'TRY TO UNDERSTAND',
    image: 'images/cards/card-31.png',
    description: 'html: "Try" on the left, and to its right a fraction with "stand" as the numerator and "2" as the denominator (a horizontal line between them) — matches the original reference photo\'s exact side-by-side layout ("2" is a homophone for "to"). Kept as a separate puzzle rather than replacing the simpler UNDERSTAND card.',
  },
  {
    id: 'once-upon-a-time',
    answer: 'ONCE UPON A TIME',
    image: 'images/cards/card-32.png',
    description: 'ai-icon: images/icons/clock.png (a round analog clock face, any time, no text — regenerated after the original clock.png was deleted once high-noon stopped using it) composited via html with the word "ONCE" centered above it.',
  },
  {
    id: 'canine',
    answer: 'CANINE',
    image: 'images/cards/card-33.png',
    description: 'html: Just "K9" (capital K, numeral 9, no space), large, centered — K-9 is a well-known homophone for "canine".',
  },
  {
    id: 'four-wheel-drive',
    answer: 'FOUR-WHEEL DRIVE',
    image: 'images/cards/card-34.png',
    description: 'html: The word "WHEEL" repeated on 4 lines, stacked vertically, all identical size (four WHEEL — "drive" is left to the well-known compound phrase "four-wheel drive").',
  },
  {
    id: 'forecast',
    answer: 'FORECAST',
    image: 'images/cards/card-35.png',
    description: 'ai-icon: images/icons/cloud.png (a simple fluffy weather cloud, no text) composited via html with the numeral "4" centered on top of it (4 sounds like "for", cloud implies weather forecast).',
  },
  {
    id: 'time-heals-all-wounds',
    answer: 'TIME HEALS ALL WOUNDS',
    image: 'images/cards/card-36.png',
    description: 'ai-icon: images/icons/bandage.png (a simple adhesive bandage strip, no text) composited via html with the word "TIME" centered on top of the bandage\'s pad.',
  },
  {
    id: 'i-see-you',
    answer: 'I SEE YOU',
    image: 'images/cards/card-37.png',
    description: 'html: "EYE", then a large "C", then a large "U" in a row (EYE=I, C="see", U="you") — a simplified, more reliable version of a reference photo card whose exact icon-plus-letter composition wasn\'t confidently decodable; this uses the standard, well-known "ICU" rebus convention instead.',
  },
  {
    id: 'parallel-streets',
    answer: 'PARALLEL STREETS',
    image: 'images/cards/card-38.png',
    description: 'html: "STREET" centered, two horizontal lines close together directly underneath it (parallel lines), then "STREET" again underneath that.',
  },
  // The following puzzles (card-39 through card-59) are cropped directly
  // from two user-supplied reference sheets, not generated/rendered by
  // this project — `description` records the source crop instead of a
  // generation prompt. See specs/001-rebus-rumble/plan.md Decision #9.
  {
    id: 'three-blind-mice',
    answer: 'THREE BLIND MICE',
    image: 'images/cards/card-39.png',
    description: 'crop: "MCEMCEMCE" — MICE repeated 3 times with the "I" omitted each time (colored "E"s mark the gap) — from the owner-supplied reference sheet (IMG_2920).',
  },
  {
    id: 'touchdown',
    answer: 'TOUCHDOWN',
    image: 'images/cards/card-40.png',
    description: 'crop: "TOUCH" large, "DOWN" small underneath — from the owner-supplied reference sheet (IMG_2920).',
  },
  {
    id: 'six-feet-under-ground',
    answer: 'SIX FEET UNDER GROUND',
    image: 'images/cards/card-41.png',
    description: 'crop: "GROUND" above two lines of "FEEEET" (each stretched to exactly 6 letters = "SIX" letters) — from the owner-supplied reference sheet (IMG_2920).',
  },
  {
    id: 'wide-eyed',
    answer: 'WIDE-EYED',
    image: 'images/cards/card-42.png',
    description: 'crop: "E" and "YE" spaced far apart on the same line (E...YE = EYE, the wide gap = WIDE) — from the owner-supplied reference sheet (IMG_2920).',
  },
  {
    id: 'old-age',
    answer: 'OLD AGE',
    image: 'images/cards/card-43.png',
    description: 'crop: "100" with "AGE" written small over the last "0" — from the owner-supplied reference sheet (IMG_2920).',
  },
  {
    id: 'a-walk-in-the-park',
    answer: 'A WALK IN THE PARK',
    image: 'images/cards/card-44.png',
    description: 'crop: a park bench with "WALK" written across it — from the owner-supplied reference sheet (IMG_2920).',
  },
  {
    id: 'around-the-world-v2',
    answer: 'AROUND THE WORLD',
    image: 'images/cards/card-45.png',
    description: 'crop: "WORLD" with two circular/infinity-style arrows looping around it — from the owner-supplied reference sheet (IMG_2920). Succeeds where an earlier ribbon-icon attempt at the same answer was dropped for being unclear (plan.md Decision #8) — the circular arrows read as "around" unambiguously.',
  },
  {
    id: 'are-you-ok',
    answer: 'ARE YOU OK',
    image: 'images/cards/card-46.png',
    description: 'crop: "R" (=ARE), a dash, and an OK hand-gesture emoji (=OK) — from the owner-supplied reference sheet (IMG_2921). Not in the owner\'s answer list for that sheet (every other card was); inferred from the visual itself.',
  },
  {
    id: 'mind-your-own-business',
    answer: 'MIND YOUR OWN BUSINESS',
    image: 'images/cards/card-47.png',
    description: 'crop: "MIND" with a large red "X" struck through it — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'ballpark-figure',
    answer: 'BALLPARK FIGURE',
    image: 'images/cards/card-48.png',
    description: 'crop: a pair of glasses above the word "BALL" — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'a-penny-for-your-thoughts',
    answer: 'A PENNY FOR YOUR THOUGHTS',
    image: 'images/cards/card-49.png',
    description: 'crop: a stack of coins next to the letter "A" — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'foreclosed',
    answer: 'FORECLOSED',
    image: 'images/cards/card-50.png',
    description: 'crop: a green numeral "4" with a "$" — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'roundtown',
    answer: 'ROUNDTOWN',
    image: 'images/cards/card-51.png',
    description: 'crop: "TOWN" inside a circle outline (circle = round) — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'tell-a-lie',
    answer: 'TELL A LIE',
    image: 'images/cards/card-52.png',
    description: 'crop: "T", a small tilted/crooked lowercase "l", and "E" — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'bridge-the-gap',
    answer: 'BRIDGE THE GAP',
    image: 'images/cards/card-53.png',
    description: 'crop: a map-pin icon containing a bridge — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'kidnap',
    answer: 'KIDNAP',
    image: 'images/cards/card-54.png',
    description: 'crop: "KN", a sleeping/"zzz" face emoji, "P" — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'handshake-deal',
    answer: 'HAND SHAKE DEAL',
    image: 'images/cards/card-55.png',
    description: 'crop: a handshake icon above the word "DEAL" — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'a-century-old',
    answer: 'A CENTURY OLD',
    image: 'images/cards/card-56.png',
    description: 'crop: "AGE" with a blue arrow pointing to "100" — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'hand-over-fist',
    answer: 'HAND OVER FIST',
    image: 'images/cards/card-57.png',
    description: 'crop: a hand icon above stacks of gold bars marked with "+" — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'scaredy-cat',
    answer: 'SCAREDY-CAT',
    image: 'images/cards/card-58.png',
    description: 'crop: a black cat silhouette next to a large "S" — from the owner-supplied reference sheet (IMG_2921).',
  },
  {
    id: 'tea-time',
    answer: 'TEA-TIME',
    image: 'images/cards/card-59.png',
    description: 'crop: a clock face with "T" and "Y" positioned on it — from the owner-supplied reference sheet (IMG_2921).',
  },
];
