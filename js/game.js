// Pure rules engine for Rebus Rumble. No DOM, no network — same convention
// as the sibling games. Deliberately no timer and no hints (see
// specs/001-rebus-rumble/plan.md Decision #1): this is the simplest of the
// three rebus frameworks the concept was drawn from.

export const PHASE = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAMEOVER: 'gameover',
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

// Copies deck[puzzleIndex] into state.puzzle, or ends the game if the deck
// is exhausted. Returns false if the game ended, true if a puzzle was
// dealt. Every transition — award or skip — goes through here.
function dealPuzzle(state) {
  state.puzzleIndex += 1;
  const next = state.deck[state.puzzleIndex];
  if (!next) {
    endGame(state);
    return false;
  }
  state.puzzle = next;
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
