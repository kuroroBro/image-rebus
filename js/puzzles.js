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
    description: 'ai-icon: images/icons/book-cover.png (the back of an open book cover showing front, spine, and back covers) with the word "COVER" written on both the front and back cover halves (representing "COVER TO COVER").',
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
    description: 'html: The word "ROADS" written twice — once horizontally and once vertically — intersecting at the letter "A" to form a cross (cross-roads).',
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
    description: 'ai-icon: images/icons/eye.png (a simple black eye outline) composited via html with the letter "C" in the middle and the letter "U" on the right (Eye + C + U = "I C U" = "I see you").',
  },
  {
    id: 'parallel-streets',
    answer: 'PARALLEL STREETS',
    image: 'images/cards/card-38.png',
    description: 'html: "STREET" centered, two horizontal lines close together directly underneath it (parallel lines), then "STREET" again underneath that.',
  },
// The following puzzles (card-39 through card-59) are sourced from
  // two user-supplied reference sheets, then cleaned, centered, and
  // recomposited into the standard 800x800 card template with a 6px black
  // border. `description` records the source crop details.
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
    description: 'ai-icon: images/icons/globe-arrows.png (a simple world globe with two circular arrows looping around it representing "around the world").',
  },
  {
    id: 'are-you-ok',
    answer: 'ARE YOU OK',
    image: 'images/cards/card-46.png',
    description: 'ai-icon: images/icons/ok-hand.png (a black hand making the OK gesture) composited via html with the letter "R" on the left and the letter "U" in the middle (R + U + OK hand = "R U OK" = "Are you OK").',
  },
  {
    id: 'mind-your-own-business',
    answer: 'MIND YOUR OWN BUSINESS',
    image: 'images/cards/card-47.png',
    description: 'html: A stylized black brain silhouette (representing "MIND") on the left, next to the word "BUSINESS" on the right with a large red X overlaid on the letter "I" (representing "MIND YOUR [I/eye/own] BUSINESS").',
  },
  {
    id: 'ballpark-figure',
    answer: 'BALLPARK FIGURE',
    image: 'images/cards/card-48.png',
    description: 'ai-icon: images/icons/baseball-diamond.png (a top-down baseball diamond infield path) composited via html with a large number "9" centered inside it (baseball park = "ballpark", number 9 = "figure").',
  },
  {
    id: 'a-penny-for-your-thoughts',
    answer: 'A PENNY FOR YOUR THOUGHTS',
    image: 'images/cards/card-49.png',
    description: 'ai-icon: images/icons/thought-bubble.png (a simple black thought bubble) composited via html: the letter "A" next to the thought bubble, with the word "PENNY" centered inside the bubble (A + penny inside thought bubble = "A PENNY FOR YOUR THOUGHTS").',
  },
  {
    id: 'foreclosed',
    answer: 'FORECLOSED',
    image: 'images/cards/card-50.png',
    description: 'html: The word "CLOSED" repeated 4 times in a vertical column (four closed — "foreclosed").',
  },
  {
    id: 'roundtown',
    answer: 'ROUNDTOWN',
    image: 'images/cards/card-51.png',
    description: 'html: The word "TOWN" centered inside a clean black circle outline (circle = round — "ROUNDTOWN").',
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
    description: 'ai-icon: images/icons/bridge.png (a simple black arched/suspension bridge) composited via html: "THE" on the left and "GAP" on the right, with the bridge spanning a physical gap between them.',
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
    description: 'ai-icon: images/icons/handshake.png (a black flat icon of a handshake) composited via html with the word "DEAL" centered below it.',
  },
  {
    id: 'a-century-old',
    answer: 'A CENTURY OLD',
    image: 'images/cards/card-56.png',
    description: 'html: The letter "A", the number "100" (representing a century), and the word "OLD", stacked vertically and centered.',
  },
  {
    id: 'hand-over-fist',
    answer: 'HAND OVER FIST',
    image: 'images/cards/card-57.png',
    description: 'ai-icon: images/icons/hand.png and images/icons/fist.png, with the hand icon vertically above the fist icon (representing "HAND OVER FIST").',
  },
  {
    id: 'scaredy-cat',
    answer: 'SCAREDY-CAT',
    image: 'images/cards/card-58.png',
    description: 'ai-icon: images/icons/scaredy-cat.png (a frightened cat with arched back and wide eyes) composited via html with a large letter "S" next to it (S + scaredy-cat icon = "SCAREDY-CAT").',
  },
  {
    id: 'tea-time',
    answer: 'TEA-TIME',
    image: 'images/cards/card-59.png',
    description: 'ai-icon: images/icons/clock.png (a simple analog clock face) composited via html with the letter "T" centered to its left (T + Time = "TEA-TIME").',
  },
  {
    id: 'hating-kapatid',
    answer: 'HATING KAPATID',
    image: 'images/cards/card-60.png',
    description: 'html: The text "KAP / ID" centered (representing the Tagalog wordplay "Hating Kap and ID" = "Hating Kapatid").',
  },
  {
    id: 'haba-ng-buhok',
    answer: 'HABA NG BUHOK',
    image: 'images/cards/card-61.png',
    description: 'html: The letters in the word "BUHOK" repeated 3 times each, spelling "BBBUUUHHHOOOKKK" (representing "Haba ng buhok").',
  },
  {
    id: 'advice',
    answer: 'ADVICE',
    image: 'images/cards/card-62.png',
    description: 'html: The text "VICE + VICE" (representing adding vice = "ADVICE").',
  },
  {
    id: 'forgive-and-forget',
    answer: 'FORGIVE AND FORGET',
    image: 'images/cards/card-63.png',
    description: 'html: A 4x2 grid containing the word "GIVE" 4 times next to the word "GET" 4 times (four Give and four Get = "FORGIVE AND FORGET").',
  },
  {
    id: 'birds-eye-view',
    answer: "BIRD'S-EYE VIEW",
    image: 'images/cards/card-64.png',
    description: 'ai-icon: images/icons/bird.png (a red bird profile silhouette) centered on the card, with a tiny copy of the word "VIEW" written inside the bird\'s eye (representing a bird\'s-eye view).',
  },
  {
    id: 'first-aid',
    answer: 'FIRST AID',
    image: 'images/cards/card-65.png',
    description: 'html: Three stacked rounded capsule outline shapes containing the word "AID", with the top one highlighted in red (representing "first Aid").',
  },
  {
    id: 'misunderstand',
    answer: 'MISUNDERSTAND',
    image: 'images/cards/card-66.png',
    description: 'html: The word "STAND" at the top, and a girl restroom sign (representing "MISS") positioned underneath it (representing "MISS under STAND" = "MISUNDERSTAND").',
  },
  {
    id: 'scrambled-eggs',
    answer: 'SCRAMBLED EGGS',
    image: 'images/cards/card-67.png',
    description: 'html: A 2x2 grid containing scrambled versions of the word "eggs": "SEGG", "GGES", "GEGS", "EGSG" (representing "SCRAMBLED EGGS").',
  },
  {
    id: '24-7',
    answer: '24/7',
    image: 'images/cards/card-68.png',
    description: 'html: The number "24" surrounded by 6 copies of "24" arranged in a circle (representing "24 seven times" = "24/7").',
  },
  {
    id: 'once-in-my-life',
    answer: 'FOR ONCE IN MY LIFE',
    image: 'images/cards/card-69.png',
    description: 'html: The text "M1Y L1I1F1E" where the number "1" (once) is interspersed 4 times inside "MY LIFE" and highlighted in red (representing "four ones in my life" = "FOR ONCE IN MY LIFE").',
  },
  {
    id: 'sit-ups',
    answer: 'SIT-UPS',
    image: 'images/cards/card-70.png',
    description: 'html: The letters "t", "i", "s" stacked vertically (reading bottom-to-top as "SIT") next to an upward-pointing black arrow (representing "SIT ups").',
  },
  {
    id: 'on-second-thought',
    answer: 'ON SECOND THOUGHT',
    image: 'images/cards/card-71.png',
    description: 'html: The word "THOUGHT" written twice stacked vertically (first in grey, second in black), with a large red circle drawn around the second instance (representing "ON SECOND THOUGHT").',
  },
  {
    id: 'sixth-sense',
    answer: 'SIXTH SENSE',
    image: 'images/cards/card-72.png',
    description: 'html: The word "SENSE" repeated 6 times stacked vertically, with the 6th instance highlighted in red (representing "SIXTH SENSE").',
  },
  {
    id: 'shop-lift',
    answer: 'SHOP LIFT',
    image: 'images/cards/card-73.png',
    description: 'ai-icon: images/icons/crane.png (a black crane hook) placed at the top, lifting the word "SHOP" below it via two supporting rope lines (representing "SHOP LIFT").',
  },
  {
    id: 'fortunate',
    answer: 'FORTUNATE',
    image: 'images/cards/card-74.png',
    description: 'ai-icon: images/icons/fish.png (a simple black fish/tuna shape) positioned between the numbers "4" and "8" (representing "4-tuna-8" = "FORTUNATE").',
  },
  {
    id: 'discount',
    answer: 'DISCOUNT',
    image: 'images/cards/card-75.png',
    description: 'html: The letters "DIS" positioned next to a counting sequence "1 2 3 4" (representing "DIS count" = "DISCOUNT").',
  },
  {
    id: 'tripod',
    answer: 'TRIPOD',
    image: 'images/cards/card-76.png',
    description: 'html: The word "POD" written 3 times stacked vertically (three pods = "TRIPOD").',
  },
  {
    id: 'elbow',
    answer: 'ELBOW',
    image: 'images/cards/card-77.png',
    description: 'html: The letters "B O W" forming a capital "L" shape where "B" is above "O" and "W" is to the right of "O" (representing "B O W" in "L" shape = "L-bow" = "ELBOW").',
  },
  {
    id: 'metaphor',
    answer: 'METAPHOR',
    image: 'images/cards/card-78.png',
    description: 'html: The word "META" repeated 4 times stacked vertically (representing four Metas = "METAPHOR").',
  },
  {
    id: 'summary',
    answer: 'SUMMARY',
    image: 'images/cards/card-79.png',
    description: 'html: The text "MARY + MARY" (representing adding Mary / Sum Mary = "SUMMARY").',
  },
  {
    id: 'look-me-in-the-eye',
    answer: 'LOOK ME IN THE EYE',
    image: 'images/cards/card-80.png',
    description: 'ai-icon: images/icons/eye.png (a simple black eye outline) with the word "ME" written inside its pupil, next to the word "LOOK" on the left (representing "Look ME in the EYE").',
  },
  {
    id: 'times-up',
    answer: "TIME'S UP",
    image: 'images/cards/card-81.png',
    description: 'html: The word "TIMES" centered with a vertical arrow pointing up next to it (representing "TIMES UP").',
  },
  {
    id: 'spaceship',
    answer: 'SPACESHIP',
    image: 'images/cards/card-82.png',
    description: 'html: The letters in the word "SHIP" written with wide spaces between them, spelling "S  H  I  P" (representing a spaced-out ship = "SPACESHIP").',
  },
  {
    id: 'comfortable',
    answer: 'COMFORTABLE',
    image: 'images/cards/card-83.png',
    description: 'html: The word "COME" centered next to a vertical stack of the word "table" repeated 4 times (representing "Come for table" = "COMFORTABLE").',
  },
  {
    id: 'once-in-a-blue-moon',
    answer: 'ONCE IN A BLUE MOON',
    image: 'images/cards/card-84.png',
    description: 'html: The letters spelling "MOONCEON" where the letters M, O, O, N at the edges are colored blue and C, E in the middle are colored black (representing the word "ONCE" inside a blue "MOON" = "ONCE IN A BLUE MOON").',
  },
  {
    id: 'friendship',
    answer: 'FRIENDSHIP',
    image: 'images/cards/card-85.png',
    description: 'ai-icon: images/icons/ship.png (a simple black sailboat/ship shape) positioned next to the word "FRIEND" (representing "FRIENDSHIP").',
  },
  {
    id: 'icecube',
    answer: 'ICECUBE',
    image: 'images/cards/card-86.png',
    description: 'html: The word "ICE" with a superscript "3" next to it (representing raising "ICE" to the 3rd power / cubed = "ICECUBE").',
  },
  {
    id: 'eye-shadow',
    answer: 'EYE SHADOW',
    image: 'images/cards/card-87.png',
    description: 'ai-icon: images/icons/eye.png (a simple black eye outline) with a matching grey offset shadow behind it (representing "EYE SHADOW").',
  },
  {
    id: 'in-between-jobs',
    answer: 'IN BETWEEN JOBS',
    image: 'images/cards/card-88.png',
    description: 'html: The word "IN" (highlighted in red) positioned between two copies of the word "JOB" (representing "IN between JOBS").',
  },
  {
    id: 'for-instance',
    answer: 'FOR INSTANCE',
    image: 'images/cards/card-89.png',
    description: 'html: The text "STA4NCE" where the number "4" (four) is highlighted in red (representing "four in stance" = "FOR INSTANCE").',
  },
  {
    id: 'download',
    answer: 'DOWNLOAD',
    image: 'images/cards/card-90.png',
    description: 'html: The letters "L", "O", "A", "D" stacked vertically to spell "LOAD" downwards (representing "DOWNLOAD").',
  },
  {
    id: 'screwdriver',
    answer: 'SCREWDRIVER',
    image: 'images/cards/card-91.png',
    description: 'ai-icon: images/icons/car.png (a black profile of a car) with a small red screw icon (images/icons/screw.png) placed inside the front window on the driver\'s side (representing "screw in driver" = "SCREWDRIVER").',
  },
  {
    id: 'big-fish-in-a-small-pond',
    answer: 'BIG FISH IN A SMALL POND',
    image: 'images/cards/card-92.png',
    description: 'html: The letters spelling "poFISHnd" where "po" and "nd" are lowercase and small, and "FISH" is uppercase and very large (representing "BIG FISH in a small POND").',
  },
  {
    id: 'longterm',
    answer: 'LONGTERM',
    image: 'images/cards/card-93.png',
    description: 'html: An exceptionally tall letter "L" with the word "term" written at its lower-left corner (representing "LONGTERM").',
  },
  {
    id: 'fooling-around',
    answer: 'FOOLING AROUND',
    image: 'images/cards/card-94.png',
    description: 'html: The word "FOOLING" written inside a circular looping arrow (representing "FOOLING AROUND").',
  },
  {
    id: 'too-big-to-ignore',
    answer: 'TOO BIG TO IGNORE',
    image: 'images/cards/card-95.png',
    description: 'html: The text "TOO BIG TO IGNORE" written horizontally, where "BIG" is in a massive font and "IGNORE" is in a tiny font (representing "TOO BIG to IGNORE").',
  },
  {
    id: 'no-second-chance',
    answer: 'NO SECOND CHANCE',
    image: 'images/cards/card-96.png',
    description: 'html: The word "CHANCE" written twice stacked vertically, with the second instance crossed out by a large red X (representing "no second CHANCE" = "NO SECOND CHANCE").',
  },
  {
    id: 'haystack',
    answer: 'HAYSTACK',
    image: 'images/cards/card-97.png',
    description: 'html: The word "HAY" repeated 4 times vertically (representing a stack of HAY = "HAYSTACK").',
  },
  {
    id: 'sweet-tooth',
    answer: 'SWEET TOOTH',
    image: 'images/cards/card-98.png',
    description: 'html: The word "TOOTH" where the double "O" is replaced by two cute pink wrapped candy silhouettes (representing "SWEET TOOTH").',
  },
  {
    id: 'fall-in-line',
    answer: 'FALL IN LINE',
    image: 'images/cards/card-99.png',
    description: 'html: The word "FALL" (highlighted in red) positioned inside the split word "LINE" (as "LI FALL NE", representing "FALL in LINE").',
  },
  {
    id: 'touchdown',
    answer: 'TOUCHDOWN',
    image: 'images/cards/card-100.png',
    description: 'html: The word "TOUCH" positioned at the very bottom of the card (representing "TOUCHDOWN").',
  },
  {
    id: 'break-a-leg',
    answer: 'BREAK A LEG',
    image: 'images/cards/card-101.png',
    description: 'html: The word "LEG" split along a diagonal line into two halves, offset apart from each other (representing "BREAK A LEG").',
  },
  {
    id: 'crocodile-tears',
    answer: 'CROCODILE TEARS',
    image: 'images/cards/card-102.png',
    description: 'html: The word "CROCODILE" with both letter "O"s replaced by blue teardrop shapes (representing "CROCODILE TEARS").',
  },
  {
    id: 'meaning',
    answer: 'MEANING',
    image: 'images/cards/card-103.png',
    description: 'html: The word "NIMENG" on a single line, with "NI" and "NG" colored black and "ME" colored red in the middle (representing "ME" embedded in "NING" = "MEANING").',
  },
  {
    id: 'subtract',
    answer: 'SUBTRACT',
    image: 'images/cards/card-104.png',
    description: 'html: A math equation "TRACK − TRACK = " followed by an empty answer box, styled like an arithmetic problem (representing "TRACK" minus "TRACK" = "SUBTRACT", TRACK sounding like TRACT).',
  },
  {
    id: 'bigger',
    answer: 'BIGGER',
    image: 'images/cards/card-105.png',
    description: 'html: The word "BIG" written three times stacked vertically in increasing size top to bottom, with the middle (second) "BIG" circled (representing "BIGGER").',
  },
  {
    id: 'i-owe-you-one',
    answer: 'I OWE YOU ONE',
    image: 'images/cards/card-106.png',
    description: 'ai-icon: images/icons/trophy.png (a simple flat gold trophy cup, no text) composited via html: the letter "I" positioned to the left, outside a large circle outline containing the letter "U" (circle = "O", so "I" + circle + "U" = "IOU"), with the trophy positioned below (a trophy implies "number ONE") — representing "I OWE YOU ONE".',
  },
  {
    id: 'display',
    answer: 'DISPLAY',
    image: 'images/cards/card-107.png',
    description: 'ai-icon: images/icons/kids-playing.png (two simple flat cartoon kids holding hands, mid-jump, no text) composited via html with the word "DIS" centered above it (DIS + kids PLAYing = "DISPLAY").',
  },
  {
    id: 'lamb-chop',
    answer: 'LAMB CHOP',
    image: 'images/cards/card-108.png',
    description: 'ai-icon: images/icons/cleaver.png (a simple flat meat cleaver, blade angled, no text) composited via html: the word "LAMB" split apart into "LA" and "MB" with the cleaver overlaid diagonally in the gap between them (representing "LAMB" being CHOPped = "LAMB CHOP").',
  },
  {
    id: 'teardrop',
    answer: 'TEARDROP',
    image: 'images/cards/card-109.png',
    description: 'html: A dashed vertical line drops from the top of the card down to a ground line near the bottom, where the word "TEAR" lands tilted and sprawled across the ground line, like something dropped from a high place and landed in a sleeping/collapsed pose (representing "TEARDROP").',
  },
];
