import test from 'node:test';
import assert from 'node:assert';
import {
  PHASE, TIMER_STATUS, createGame, startGame, awardPoint, skipPuzzle,
  revealLetter, revealImage, startTimer, checkTimerExpired, timerRemainingMs, maskedAnswer,
  checkGuess,
} from '../js/game.js';

const POOL = [
  { id: 'p1', answer: 'SUNFLOWER', icons: ['sun', 'flower'] },
  { id: 'p2', answer: 'RAINBOW', icons: ['rain', 'bow'] },
  { id: 'p3', answer: 'CUPCAKE', icons: ['cup', 'cake'] },
  { id: 'p4', answer: 'STARFISH', icons: ['star', 'fish'] },
];

function freshGame(settings = {}, pool = POOL, rng = Math.random) {
  return createGame(settings, pool, rng);
}

test('createGame builds a full shuffled deck with default team names and no target score', () => {
  const game = freshGame();
  assert.strictEqual(game.phase, PHASE.LOBBY);
  assert.strictEqual(game.deck.length, POOL.length);
  assert.strictEqual(new Set(game.deck.map((p) => p.id)).size, POOL.length); // every puzzle present once
  assert.strictEqual(game.teams.a.name, 'Team A');
  assert.strictEqual(game.teams.b.name, 'Team B');
  assert.strictEqual(game.teams.a.score, 0);
  assert.strictEqual(game.targetScore, null);
  assert.strictEqual(game.puzzle, null);
});

test('custom team names and target score are honored', () => {
  const game = freshGame({ teamNames: { a: 'Reds', b: 'Blues' }, targetScore: 5 });
  assert.strictEqual(game.teams.a.name, 'Reds');
  assert.strictEqual(game.teams.b.name, 'Blues');
  assert.strictEqual(game.targetScore, 5);
});

test('startGame deals the first puzzle and moves to playing', () => {
  const game = freshGame();
  assert.strictEqual(startGame(game), true);
  assert.strictEqual(game.phase, PHASE.PLAYING);
  assert.ok(game.puzzle);
  assert.strictEqual(game.puzzleIndex, 0);
});

test('startGame is a no-op outside the lobby or with an empty deck', () => {
  const game = freshGame();
  startGame(game);
  assert.strictEqual(startGame(game), false); // already playing
  const empty = freshGame({}, []);
  assert.strictEqual(startGame(empty), false);
  assert.strictEqual(empty.phase, PHASE.LOBBY);
});

test('awardPoint scores the team and deals the next puzzle', () => {
  const game = freshGame();
  startGame(game);
  const firstId = game.puzzle.id;
  assert.strictEqual(awardPoint(game, 'a'), true);
  assert.strictEqual(game.teams.a.score, 1);
  assert.strictEqual(game.teams.b.score, 0);
  assert.notStrictEqual(game.puzzle.id, firstId);
  assert.strictEqual(game.phase, PHASE.PLAYING);
});

test('awardPoint rejects an unknown team and does nothing outside playing', () => {
  const game = freshGame();
  assert.strictEqual(awardPoint(game, 'a'), false); // still in lobby
  startGame(game);
  assert.strictEqual(awardPoint(game, 'c'), false);
  assert.strictEqual(game.teams.a.score, 0);
  assert.strictEqual(game.teams.b.score, 0);
});

test('skipPuzzle deals the next puzzle with no score change', () => {
  const game = freshGame();
  startGame(game);
  const firstId = game.puzzle.id;
  assert.strictEqual(skipPuzzle(game), true);
  assert.notStrictEqual(game.puzzle.id, firstId);
  assert.strictEqual(game.teams.a.score, 0);
  assert.strictEqual(game.teams.b.score, 0);
});

test('reaching the target score ends the game immediately with that team as winner', () => {
  const game = freshGame({ targetScore: 2 });
  startGame(game);
  awardPoint(game, 'a');
  assert.strictEqual(game.phase, PHASE.PLAYING);
  awardPoint(game, 'a');
  assert.strictEqual(game.phase, PHASE.GAMEOVER);
  assert.strictEqual(game.winner, 'a');
  assert.strictEqual(game.puzzle, null);
});

test('deck exhaustion ends the game, higher score wins', () => {
  const game = freshGame({}, POOL.slice(0, 2)); // 2-puzzle deck, no target score
  startGame(game);
  awardPoint(game, 'a'); // 1 puzzle left, dealt
  awardPoint(game, 'b'); // deck exhausted -> game over
  assert.strictEqual(game.phase, PHASE.GAMEOVER);
  assert.strictEqual(game.teams.a.score, 1);
  assert.strictEqual(game.teams.b.score, 1);
  assert.strictEqual(game.winner, null); // tied -> draw
});

test('deck exhaustion with an unambiguous score difference picks the higher team', () => {
  const game = freshGame({}, POOL.slice(0, 2));
  startGame(game);
  awardPoint(game, 'a');
  awardPoint(game, 'a'); // deck exhausted, a leads 2-0
  assert.strictEqual(game.phase, PHASE.GAMEOVER);
  assert.strictEqual(game.winner, 'a');
});

test('skip can also exhaust the deck and end the game as a draw (0-0)', () => {
  const game = freshGame({}, POOL.slice(0, 1));
  startGame(game);
  assert.strictEqual(skipPuzzle(game), true); // the skip itself succeeds...
  assert.strictEqual(game.phase, PHASE.GAMEOVER); // ...but it was also the last puzzle
  assert.strictEqual(game.winner, null);
});

test('awardPoint and skipPuzzle are no-ops once the game is over', () => {
  const game = freshGame({ targetScore: 1 });
  startGame(game);
  awardPoint(game, 'a');
  assert.strictEqual(game.phase, PHASE.GAMEOVER);
  assert.strictEqual(awardPoint(game, 'b'), false);
  assert.strictEqual(skipPuzzle(game), false);
  assert.strictEqual(game.teams.a.score, 1);
  assert.strictEqual(game.teams.b.score, 0);
});

// ---------- hints ----------

test('revealLetter is a no-op when hints are disabled (the default)', () => {
  const game = freshGame();
  startGame(game);
  assert.strictEqual(revealLetter(game), false);
  assert.strictEqual(game.puzzle.revealedIndexes.length, 0);
});

test('revealLetter reveals one blank, non-space letter when hints are enabled', () => {
  const game = freshGame({ hintsEnabled: true }, [{ id: 'p1', answer: 'CUP CAKE' }]);
  startGame(game);
  assert.strictEqual(revealLetter(game), true);
  assert.strictEqual(game.puzzle.revealedIndexes.length, 1);
  const revealedChar = game.puzzle.answer[game.puzzle.revealedIndexes[0]];
  assert.notStrictEqual(revealedChar, ' '); // never reveals the space as a "hint"
});

test('revealLetter never reveals the same index twice and stops once fully revealed', () => {
  const game = freshGame({ hintsEnabled: true }, [{ id: 'p1', answer: 'CAB' }]);
  startGame(game);
  for (let i = 0; i < 3; i++) assert.strictEqual(revealLetter(game), true);
  assert.strictEqual(game.puzzle.revealedIndexes.length, 3);
  assert.strictEqual(new Set(game.puzzle.revealedIndexes).size, 3); // no duplicates
  assert.strictEqual(revealLetter(game), false); // nothing left to reveal
});

test('revealLetter is a no-op outside playing', () => {
  const game = freshGame({ hintsEnabled: true });
  assert.strictEqual(revealLetter(game), false); // still in lobby
});

test('a fresh puzzle always starts with no letters revealed, even after a hint on the previous one', () => {
  const game = freshGame({ hintsEnabled: true }, [
    { id: 'p1', answer: 'AB' },
    { id: 'p2', answer: 'CD' },
  ]);
  startGame(game);
  revealLetter(game);
  assert.strictEqual(game.puzzle.revealedIndexes.length, 1);
  skipPuzzle(game);
  assert.strictEqual(game.puzzle.revealedIndexes.length, 0);
});

test('maskedAnswer shows spaces always, letters only once revealed', () => {
  const game = freshGame({ hintsEnabled: true }, [{ id: 'p1', answer: 'AB CD' }]);
  startGame(game);
  let masked = maskedAnswer(game.puzzle);
  assert.deepStrictEqual(masked.map((m) => m.char), [null, null, ' ', null, null]);
  game.puzzle.revealedIndexes.push(0, 3);
  masked = maskedAnswer(game.puzzle);
  assert.deepStrictEqual(masked.map((m) => m.char), ['A', null, ' ', 'C', null]);
});

test('maskedAnswer of no puzzle is an empty array', () => {
  assert.deepStrictEqual(maskedAnswer(null), []);
});

// ---------- image reveal ----------

test('a freshly dealt puzzle image starts unrevealed (blurred)', () => {
  const game = freshGame();
  startGame(game);
  assert.strictEqual(game.puzzle.imageRevealed, false);
});

test('revealImage reveals the current puzzle image and is a no-op once already revealed', () => {
  const game = freshGame();
  startGame(game);
  assert.strictEqual(revealImage(game), true);
  assert.strictEqual(game.puzzle.imageRevealed, true);
  assert.strictEqual(revealImage(game), false); // already revealed
});

test('revealImage is a no-op outside playing', () => {
  const game = freshGame();
  assert.strictEqual(revealImage(game), false); // still in lobby
});

test('a fresh puzzle always starts with its image unrevealed, even after revealing the previous one', () => {
  const game = freshGame({}, [
    { id: 'p1', answer: 'AB' },
    { id: 'p2', answer: 'CD' },
  ]);
  startGame(game);
  revealImage(game);
  assert.strictEqual(game.puzzle.imageRevealed, true);
  skipPuzzle(game);
  assert.strictEqual(game.puzzle.imageRevealed, false);
});

// ---------- timer ----------

test('startTimer is a no-op when no timer is configured', () => {
  const game = freshGame();
  startGame(game);
  assert.strictEqual(startTimer(game, 1000), false);
  assert.strictEqual(game.timerStatus, TIMER_STATUS.PAUSED);
});

test('startTimer sets a deadline and moves to running; is a no-op if already running', () => {
  const game = freshGame({ timerSeconds: 30 });
  startGame(game);
  assert.strictEqual(startTimer(game, 1000), true);
  assert.strictEqual(game.timerStatus, TIMER_STATUS.RUNNING);
  assert.strictEqual(game.timerDeadline, 1000 + 30000);
  assert.strictEqual(startTimer(game, 5000), false); // already running
  assert.strictEqual(game.timerDeadline, 1000 + 30000); // unchanged
});

test('startTimer is a no-op outside playing', () => {
  const game = freshGame({ timerSeconds: 30 });
  assert.strictEqual(startTimer(game, 1000), false); // still in lobby
});

test('checkTimerExpired auto-skips once the deadline passes, and only then', () => {
  const game = freshGame({ timerSeconds: 30 }, POOL);
  startGame(game);
  const firstId = game.puzzle.id;
  startTimer(game, 1000);
  assert.strictEqual(checkTimerExpired(game, 20000), false); // not due yet
  assert.strictEqual(game.puzzle.id, firstId);
  assert.strictEqual(checkTimerExpired(game, 31000), true); // now due
  assert.notStrictEqual(game.puzzle.id, firstId);
  assert.strictEqual(game.timerStatus, TIMER_STATUS.PAUSED); // paused again for the new puzzle
});

test('checkTimerExpired does not change score (a timeout is not a skip penalty either way)', () => {
  const game = freshGame({ timerSeconds: 30 });
  startGame(game);
  startTimer(game, 1000);
  checkTimerExpired(game, 31000);
  assert.strictEqual(game.teams.a.score, 0);
  assert.strictEqual(game.teams.b.score, 0);
});

test('timerRemainingMs is the full duration while paused, 0 with no timer, and counts down while running', () => {
  const noTimer = freshGame();
  startGame(noTimer);
  assert.strictEqual(timerRemainingMs(noTimer, 1000), 0);

  const game = freshGame({ timerSeconds: 30 });
  startGame(game);
  assert.strictEqual(timerRemainingMs(game, 1000), 30000); // paused -> full duration
  startTimer(game, 1000);
  assert.strictEqual(timerRemainingMs(game, 1000), 30000);
  assert.strictEqual(timerRemainingMs(game, 11000), 20000);
  assert.strictEqual(timerRemainingMs(game, 40000), 0); // never negative
});

test('deck order is deterministic for a fixed rng (no accidental Math.random dependency)', () => {
  let seed = 42;
  const rng = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const gameA = createGame({}, POOL, rng);
  seed = 42;
  const gameB = createGame({}, POOL, rng);
  assert.deepStrictEqual(gameA.deck.map((p) => p.id), gameB.deck.map((p) => p.id));
});

test('checkGuess matches exactly, ignoring case and surrounding whitespace', () => {
  assert.strictEqual(checkGuess('SUNFLOWER', 'sunflower'), true);
  assert.strictEqual(checkGuess('SUNFLOWER', '  Sunflower  '), true);
  assert.strictEqual(checkGuess('SUNFLOWER', 'SUN FLOWER'), false);
  assert.strictEqual(checkGuess('SUNFLOWER', ''), false);
});

test('checkGuess requires punctuation/digits to be typed too, not stripped', () => {
  assert.strictEqual(checkGuess('TEA-TIME', 'tea-time'), true);
  assert.strictEqual(checkGuess('TEA-TIME', 'tea time'), false);
  assert.strictEqual(checkGuess('24/7', '24/7'), true);
  assert.strictEqual(checkGuess('24/7', '247'), false);
});
