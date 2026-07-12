// localStorage persistence for last-used setup choices (team names, target
// score, hints, timer). No category selection in this version — see
// spec.md Non-goals.

const SETTINGS_KEY = 'rebus.settings.v1';

export const DEFAULT_SETTINGS = {
  targetScore: 0, // 0/null = no target — play through the whole deck
  hintsEnabled: false,
  timerSeconds: 0, // 0/null = no timer
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
