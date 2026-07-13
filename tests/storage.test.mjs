import test from 'node:test';
import assert from 'node:assert';
import {
  filterByCategory, filterUnusedPuzzles, loadUsedPuzzleIds, markPuzzleUsed, resetUsedPuzzleIds,
  saveUsedPuzzleIds,
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

const CATEGORY_POOL = [
  { id: 'p1', category: 'wordplay' },
  { id: 'p2', category: 'phrase' },
  { id: 'p3', category: 'picture' },
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

test('filterByCategory keeps only puzzles matching one of the given categories', () => {
  assert.deepStrictEqual(
    filterByCategory(CATEGORY_POOL, ['phrase']).map((puzzle) => puzzle.id),
    ['p2'],
  );
});

test('filterByCategory unions multiple selected categories', () => {
  assert.deepStrictEqual(
    filterByCategory(CATEGORY_POOL, ['wordplay', 'picture']).map((puzzle) => puzzle.id),
    ['p1', 'p3'],
  );
});

test('filterByCategory returns the whole pool for an empty or missing list', () => {
  assert.deepStrictEqual(filterByCategory(CATEGORY_POOL, []), CATEGORY_POOL);
  assert.deepStrictEqual(filterByCategory(CATEGORY_POOL, undefined), CATEGORY_POOL);
});
