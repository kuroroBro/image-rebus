import test from 'node:test';
import assert from 'node:assert';
import { PHASE, createGame, startGame, awardPoint, skipPuzzle } from '../js/game.js';

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
