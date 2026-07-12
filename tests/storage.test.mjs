import test from 'node:test';
import assert from 'node:assert';
import {
  filterUnusedPuzzles, loadUsedPuzzleIds, markPuzzleUsed, resetUsedPuzzleIds, saveUsedPuzzleIds,
} from '../js/storage.js';

const store = new Map();

global.localStorage = {
  getItem(key) {
    return store.has(key) ? store.get(key) : null;
  },
  setItem(key, value) {
    store.set(key, String(value));
  },
};

const POOL = [
  { id: 'p1', answer: 'ONE' },
  { id: 'p2', answer: 'TWO' },
  { id: 'p3', answer: 'THREE' },
];

test.beforeEach(() => {
  store.clear();
});

test('markPuzzleUsed persists each puzzle id only once', () => {
  markPuzzleUsed('p1');
  markPuzzleUsed('p1');
  markPuzzleUsed('p2');

  assert.deepStrictEqual(loadUsedPuzzleIds(), ['p1', 'p2']);
});

test('filterUnusedPuzzles excludes cards already marked as used', () => {
  saveUsedPuzzleIds(['p1', 'p3']);

  assert.deepStrictEqual(filterUnusedPuzzles(POOL).map((puzzle) => puzzle.id), ['p2']);
});

test('resetUsedPuzzleIds makes all cards eligible again', () => {
  saveUsedPuzzleIds(['p1', 'p2', 'p3']);
  assert.deepStrictEqual(filterUnusedPuzzles(POOL), []);

  resetUsedPuzzleIds();
  assert.deepStrictEqual(filterUnusedPuzzles(POOL).map((puzzle) => puzzle.id), ['p1', 'p2', 'p3']);
});
