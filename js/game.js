// Pure rules engine for Rebus Rumble. No DOM, no network — same convention
// as the sibling games. Optional per-puzzle timer and letter hints, same
// shape as icon-guess-the-word/word-scramble — added post-launch at the
// owner's request (see specs/001-rebus-rumble/plan.md Decision #10); the
// original v1 shipped without either, deliberately, as the simplest of the
// three rebus frameworks the concept was drawn from.

export const PHASE = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAMEOVER: 'gameover',
};

export const TIMER_STATUS = {
  PAUSED: 'paused', // not counting down — waiting for the Host to start it
  RUNNING: 'running',
};

function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// One built-in puzzle set in this version (no category selection — see
// plan.md Decision #4), so the deck is just every puzzle, shuffled.
function buildDeck(puzzlePool, rng) {
  return shuffle(puzzlePool, rng);
}

export function createGame(settings, puzzlePool, rng = Math.random) {
  return {
    phase: PHASE.LOBBY,
    hintsEnabled: settings.hintsEnabled ?? false,
    // null/0 = timer disabled entirely (no timer UI, no auto-skip).
    timerSeconds: settings.timerSeconds || null,
    timerStatus: TIMER_STATUS.PAUSED,
    timerDeadline: null,
    // null/0 = no target — play through the whole deck. Otherwise the
    // first team to reach this score wins instantly.
    targetScore: settings.targetScore || null,
    teams: {
      a: { id: 'a', name: settings.teamNames?.a || 'Team A', score: 0 },
      b: { id: 'b', name: settings.teamNames?.b || 'Team B', score: 0 },
    },
    deck: buildDeck(puzzlePool, rng),
    puzzleIndex: -1,
    puzzle: null,
    winner: null,
  };
}

// Copies deck[puzzleIndex] into state.puzzle with a fresh revealedIndexes
// list, or ends the game if the deck is exhausted. Returns false if the
// game ended, true if a puzzle was dealt. Every transition — award, skip,
// or timer expiry — goes through here, so every new puzzle always starts
// with its timer paused, never running: the Host decides when the clock
// actually starts for the next round.
function dealPuzzle(state) {
  state.puzzleIndex += 1;
  const next = state.deck[state.puzzleIndex];
  state.timerStatus = TIMER_STATUS.PAUSED;
  state.timerDeadline = null;
  if (!next) {
    endGame(state);
    return false;
  }
  state.puzzle = { ...next, revealedIndexes: [], imageRevealed: false };
  return true;
}

// `explicitWinner` is used for a target-score win, where the team that just
// scored is unambiguously the winner — no need to compare totals. Without
// it (deck exhaustion), the winner is decided by comparing scores, with a
// tie counting as a draw (`null`).
function endGame(state, explicitWinner) {
  if (explicitWinner !== undefined) {
    state.winner = explicitWinner;
  } else {
    const { a, b } = state.teams;
    state.winner = a.score === b.score ? null : a.score > b.score ? 'a' : 'b';
  }
  state.puzzle = null;
  state.phase = PHASE.GAMEOVER;
}

export function startGame(state) {
  if (state.phase !== PHASE.LOBBY) return false;
  if (state.deck.length === 0) return false;
  state.phase = PHASE.PLAYING;
  dealPuzzle(state);
  return true;
}

// Reveals one random blank letter of the current puzzle's answer (not
// left-to-right — a fixed order makes the answer too predictable to give
// away). Spaces are never blank slots to begin with. A no-op (returns
// false) when hints are off, outside PLAYING, or the answer is already
// fully revealed — deliberately not an error, so the UI never needs to
// special-case a disabled control.
export function revealLetter(state, rng = Math.random) {
  if (state.phase !== PHASE.PLAYING || !state.hintsEnabled) return false;
  const { answer, revealedIndexes } = state.puzzle;
  const blanks = [];
  for (let i = 0; i < answer.length; i++) {
    if (answer[i] === ' ') continue;
    if (!revealedIndexes.includes(i)) blanks.push(i);
  }
  if (blanks.length === 0) return false; // fully revealed already
  const pick = blanks[Math.floor(rng() * blanks.length)];
  revealedIndexes.push(pick);
  return true;
}

// Every puzzle deals in blurred, so the Host can get set up (and build a
// little suspense) before anyone sees the card. The Host taps the image to
// reveal it — for themselves and the Display at once, since it's sent as
// part of the normal state broadcast, not a separate message. A no-op once
// already revealed, same convention as the other actions here.
export function revealImage(state) {
  if (state.phase !== PHASE.PLAYING || !state.puzzle) return false;
  if (state.puzzle.imageRevealed) return false;
  state.puzzle.imageRevealed = true;
  return true;
}

export function awardPoint(state, teamId) {
  if (state.phase !== PHASE.PLAYING) return false;
  if (!state.teams[teamId]) return false;
  state.teams[teamId].score += 1;
  if (state.targetScore && state.teams[teamId].score >= state.targetScore) {
    endGame(state, teamId); // reaching the target wins outright, no draw possible
    return true;
  }
  dealPuzzle(state);
  return true;
}

export function skipPuzzle(state) {
  if (state.phase !== PHASE.PLAYING) return false;
  dealPuzzle(state);
  return true;
}

// Starts (or restarts) the countdown for the current puzzle. A no-op if
// there's no timer configured for this game, outside PLAYING, or already
// running — deliberately not an error, same convention as revealLetter.
export function startTimer(state, now) {
  if (state.phase !== PHASE.PLAYING) return false;
  if (!state.timerSeconds) return false;
  if (state.timerStatus === TIMER_STATUS.RUNNING) return false;
  state.timerDeadline = now + state.timerSeconds * 1000;
  state.timerStatus = TIMER_STATUS.RUNNING;
  return true;
}

// Call this periodically (e.g. every 200-250ms) from the Host's own clock
// only. If the deadline has passed, auto-skips to the next puzzle (no score
// change) and leaves its timer paused, waiting for the Host to start it
// again. Returns true if a skip just happened (the caller should re-render
// and re-broadcast).
export function checkTimerExpired(state, now) {
  if (state.phase !== PHASE.PLAYING) return false;
  if (state.timerStatus !== TIMER_STATUS.RUNNING) return false;
  if (now < state.timerDeadline) return false;
  dealPuzzle(state);
  return true;
}

// Milliseconds left to show on screen. Full duration while paused (so the
// Host/Display see the configured length before it starts), 0 if no timer.
export function timerRemainingMs(state, now) {
  if (!state.timerSeconds) return 0;
  if (state.timerStatus !== TIMER_STATUS.RUNNING) return state.timerSeconds * 1000;
  return Math.max(0, state.timerDeadline - now);
}

// Letter-slot view of the current puzzle's answer: one entry per character,
// spaces always shown, letters shown only once revealed. Used by both the
// Host's own render and (via js/main.js) the redacted snapshot sent to the
// Display — this is the one place that decides what a blank tile looks
// like.
export function maskedAnswer(puzzle) {
  if (!puzzle) return [];
  return puzzle.answer.split('').map((char, i) => ({
    char: char === ' ' ? ' ' : puzzle.revealedIndexes.includes(i) ? char : null,
    isSpace: char === ' ',
  }));
}
