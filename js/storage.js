// localStorage persistence for last-used setup choices (team names, target
// score, hints, timer, puzzle category).

const SETTINGS_KEY = 'rebus.settings.v1';
const USED_PUZZLES_KEY = 'rebus.usedPuzzleIds.v1';

export const DEFAULT_SETTINGS = {
  targetScore: 0, // 0/null = no target — play through the whole deck
  hintsEnabled: false,
  timerSeconds: 0, // 0/null = no timer
  categories: [], // empty = every category (see puzzles.js's CATEGORIES ids)
  teamNames: { a: 'Team A', b: 'Team B' },
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full/blocked — the game still works for this session
  }
}

export function loadSettings() {
  const saved = read(SETTINGS_KEY, null);
  if (!saved) return structuredClone(DEFAULT_SETTINGS);
  return {
    ...structuredClone(DEFAULT_SETTINGS),
    ...saved,
    teamNames: { ...DEFAULT_SETTINGS.teamNames, ...(saved.teamNames || {}) },
  };
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings);
}

export function loadUsedPuzzleIds() {
  const saved = read(USED_PUZZLES_KEY, []);
  if (!Array.isArray(saved)) return [];
  return saved.filter((id) => typeof id === 'string');
}

export function saveUsedPuzzleIds(ids) {
  write(USED_PUZZLES_KEY, [...new Set(ids)]);
}

export function markPuzzleUsed(id) {
  if (!id) return;
  const used = loadUsedPuzzleIds();
  if (used.includes(id)) return;
  saveUsedPuzzleIds([...used, id]);
}

export function resetUsedPuzzleIds() {
  saveUsedPuzzleIds([]);
}

export function filterUnusedPuzzles(puzzlePool, usedIds = loadUsedPuzzleIds()) {
  const used = new Set(usedIds);
  return puzzlePool.filter((puzzle) => !used.has(puzzle.id));
}

// `categories` is a list of CATEGORIES ids to keep. Empty/missing means no
// restriction — every category passes, same as picking none in the UI.
export function filterByCategory(puzzlePool, categories) {
  if (!categories || categories.length === 0) return puzzlePool;
  const wanted = new Set(categories);
  return puzzlePool.filter((puzzle) => wanted.has(puzzle.category));
}
