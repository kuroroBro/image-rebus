import {
  PHASE, TIMER_STATUS, createGame, startGame, awardPoint, skipPuzzle,
  revealLetter, revealImage, maskedAnswer, startTimer, checkTimerExpired, timerRemainingMs,
  checkGuess,
} from './game.js';
import { CATEGORIES, PUZZLES } from './puzzles.js';
import {
  filterByCategory, filterUnusedPuzzles, loadSettings, markPuzzleUsed, resetUsedPuzzleIds,
  saveSettings,
} from './storage.js';
import { hostRoom, joinRoom, normalizeCode } from './room.js';

const $ = (id) => document.getElementById(id);

const SCREENS = [
  'screen-home', 'screen-setup', 'screen-host-lobby',
  'screen-host-panel', 'screen-single-panel', 'screen-display', 'screen-gameover',
];

function showScreen(id) {
  for (const s of SCREENS) $(s).hidden = s !== id;
}

// ---------- module state ----------
let settings = loadSettings();
let game = null;        // Host: full state. Display: last redacted snapshot received.
let room = null;        // { code, broadcast, close } (host) or { close } (display)
let role = null;        // 'host' | 'display' | 'single'
let peerCount = 0;
let clockOffset = 0;    // Display only: hostNow - Date.now() at last snapshot
// Host only, never sent over the network (the Display never gets the raw
// answer regardless — see redactState). Resets to false every time a new
// puzzle is dealt, so the Host has to tap to see the answer each round.
let hostAnswerRevealed = false;
let setupMode = 'host'; // 'host' | 'single'
let singleAnswerVisible = false;

const RESET_USED_CARDS_MESSAGE = 'All rebus cards have been used. Reset card data so cards can be reused?';

// ---------- shared render helper (letter-hint tiles) ----------
// Takes the *masked* array ({char, isSpace}[]) from game.js's maskedAnswer,
// not the raw puzzle — this is what keeps the Display's render path
// identical whether it's driven by the Host's own puzzle or a redacted
// network snapshot.
function renderTiles(container, masked) {
  container.innerHTML = '';
  if (!masked || masked.length === 0) return;
  let group = document.createElement('div');
  group.className = 'tile-word-group';
  container.appendChild(group);
  for (const { char, isSpace } of masked) {
    if (isSpace) {
      group = document.createElement('div');
      group.className = 'tile-word-group';
      container.appendChild(group);
      continue;
    }
    const tile = document.createElement('div');
    tile.className = 'letter-tile' + (char ? ' revealed' : '');
    tile.textContent = char || '';
    group.appendChild(tile);
  }
}

// Shows the countdown, or an infinity glyph when this game has no timer
// configured at all — the timer readout and Start Timer button are always
// visible (never hidden), so "no timer" needs its own visible state rather
// than an empty/zeroed one.
function updateTimerDisplay(el, remainingMs, hasTimer) {
  if (!hasTimer) {
    el.textContent = '∞';
    el.classList.remove('timer-urgent');
    return;
  }
  el.textContent = String(Math.ceil(remainingMs / 1000));
  el.classList.toggle('timer-urgent', remainingMs > 0 && remainingMs <= 10_000);
}

// ---------- redaction: what the Display is allowed to see ----------
// The Host never sends the raw answer — and never sends `puzzle.id` either,
// since it's a descriptive slug (e.g. "understand") that would spell out
// the answer just as much as the word itself would. `image` is safe as-is:
// it's an opaque filename (card-01.png, see js/puzzles.js), and the picture
// it points to is the puzzle everyone's meant to see, not a secret.
// `masked` only ever contains letters that have already been revealed
// (plus spaces, which are never secret) — same redaction principle as the
// answer image, just for hints. Timer fields are never secret.
function redactState(state) {
  return {
    phase: state.phase,
    hintsEnabled: state.hintsEnabled,
    timerSeconds: state.timerSeconds,
    timerStatus: state.timerStatus,
    timerDeadline: state.timerDeadline,
    targetScore: state.targetScore,
    teams: state.teams,
    winner: state.winner,
    puzzle: state.puzzle
      ? {
          image: state.puzzle.image,
          masked: maskedAnswer(state.puzzle),
          imageRevealed: state.puzzle.imageRevealed,
        }
      : null,
  };
}

function broadcastState() {
  if (room && role === 'host') {
    room.broadcast({ t: 'state', state: redactState(game), hostNow: Date.now() });
  }
}

function createGameFromUnusedCards(gameSettings = settings) {
  const categoryPool = filterByCategory(PUZZLES, gameSettings.categories);
  let puzzlePool = filterUnusedPuzzles(categoryPool);
  if (puzzlePool.length === 0) {
    if (!window.confirm(RESET_USED_CARDS_MESSAGE)) return null;
    resetUsedPuzzleIds();
    puzzlePool = categoryPool;
  }
  return createGame(gameSettings, puzzlePool);
}

function markCurrentPuzzleUsed() {
  if ((role === 'host' || role === 'single') && game?.puzzle?.id) markPuzzleUsed(game.puzzle.id);
}

// ---------- confetti (small, dependency-free) ----------
const CONFETTI_COLORS = ['#ff5d5d', '#ffd23f', '#4ecdc4', '#fbf6ec'];

function confettiBurst(side) {
  for (let i = 0; i < 24; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const originX = side === 'left' ? Math.random() * 30 : 70 + Math.random() * 30;
    piece.style.left = originX + 'vw';
    piece.style.animationDuration = (1.1 + Math.random() * 0.8) + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2200);
  }
}

function bumpPlaque(team) {
  const el = $(`display-plaque-${team}`);
  el.classList.remove('bump');
  void el.offsetWidth; // restart the animation
  el.classList.add('bump');
  confettiBurst(team === 'a' ? 'left' : 'right');
}

// ==================================================================
// HOME
// ==================================================================
$('btn-how-to-play').addEventListener('click', () => {
  $('dialog-how-to-play').showModal();
});

$('btn-close-how-to-play').addEventListener('click', () => {
  $('dialog-how-to-play').close();
});

// One checkbox per CATEGORIES entry, checked to match `selected`. Rebuilt
// fresh each time Setup opens rather than kept in sync incrementally —
// there are only 4 of these, and it keeps the source of truth (CATEGORIES)
// and the DOM from ever drifting apart.
function renderCategoryChecks(selected) {
  const container = $('input-categories');
  container.innerHTML = '';
  for (const { id, label } of CATEGORIES) {
    const row = document.createElement('label');
    row.className = 'checkbox-row';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = id;
    input.checked = selected.includes(id);
    const span = document.createElement('span');
    span.textContent = label;
    row.append(input, span);
    container.appendChild(row);
  }
}

function readCheckedCategories() {
  return Array.from($('input-categories').querySelectorAll('input:checked')).map((el) => el.value);
}

$('btn-host').addEventListener('click', () => {
  openSetup('host');
});

$('btn-single').addEventListener('click', () => {
  openSetup('single');
});

function openSetup(mode) {
  setupMode = mode;
  $('input-team-a').value = settings.teamNames.a;
  $('input-team-b').value = settings.teamNames.b;
  $('input-target-score').value = String(settings.targetScore || 0);
  $('input-hints').checked = settings.hintsEnabled;
  $('input-timer').value = String(settings.timerSeconds || 0);
  renderCategoryChecks(settings.categories || []);
  $('setup-error').hidden = true;
  $('btn-start-single').hidden = mode !== 'single';
  $('btn-start-room').hidden = mode !== 'host';
  showScreen('screen-setup');
}

$('btn-join').addEventListener('click', () => {
  const code = normalizeCode($('input-join-code').value);
  $('home-error').hidden = true;
  if (!code) {
    $('home-error').hidden = false;
    $('home-error').textContent = 'Enter the 4-letter room code from the Host.';
    return;
  }
  $('btn-join').disabled = true;
  joinRoom(code, { onState: handleDisplayState, onClose: handleDisplayClose })
    .then((result) => {
      $('btn-join').disabled = false;
      room = result;
      role = 'display';
      game = null;
      resetDisplayView();
      showScreen('screen-display');
    })
    .catch((err) => {
      $('btn-join').disabled = false;
      $('home-error').hidden = false;
      $('home-error').textContent = err.message;
    });
});

// ==================================================================
// SETUP
// ==================================================================
$('btn-setup-back').addEventListener('click', () => showScreen('screen-home'));

function readSetupSettings() {
  return {
    targetScore: Number($('input-target-score').value),
    hintsEnabled: $('input-hints').checked,
    timerSeconds: Number($('input-timer').value),
    categories: readCheckedCategories(),
    teamNames: {
      a: $('input-team-a').value.trim() || 'Team A',
      b: $('input-team-b').value.trim() || 'Team B',
    },
  };
}

$('btn-start-room').addEventListener('click', () => {
  $('setup-error').hidden = true;
  settings = readSetupSettings();
  saveSettings(settings);
  game = createGameFromUnusedCards();
  if (!game) {
    $('setup-error').hidden = false;
    $('setup-error').textContent = 'No unused cards left. Reset card data to start a new game.';
    return;
  }
  role = 'host';

  $('btn-start-room').disabled = true;
  hostRoom({ onPeers: handlePeers, onError: handleHostRoomError })
    .then((result) => {
      $('btn-start-room').disabled = false;
      room = result;
      peerCount = 0;
      $('room-code').textContent = room.code;
      $('room-peers').textContent = '0';
      $('host-lobby-error').hidden = true;
      showScreen('screen-host-lobby');
    })
    .catch((err) => {
      $('btn-start-room').disabled = false;
      $('setup-error').hidden = false;
      $('setup-error').textContent = err.message;
    });
});

$('btn-start-single').addEventListener('click', () => {
  $('setup-error').hidden = true;
  settings = readSetupSettings();
  saveSettings(settings);
  game = createGameFromUnusedCards({
    ...settings,
    teamNames: { a: 'Solved', b: 'Skipped' },
  });
  if (!game) {
    $('setup-error').hidden = false;
    $('setup-error').textContent = 'No unused cards left. Reset card data to start a new game.';
    return;
  }
  role = 'single';
  room?.close?.();
  room = null;
  peerCount = 0;
  singleAnswerVisible = false;
  startGame(game);
  markCurrentPuzzleUsed();
  renderSinglePanel();
  showScreen('screen-single-panel');
});

// ==================================================================
// HOST LOBBY (room open, game not started yet)
// ==================================================================
function handlePeers(count) {
  peerCount = count;
  $('room-peers').textContent = String(count);
  $('host-peers').textContent = count > 0 ? `${count} connected` : 'Display not connected';
  // A freshly-joined Display has nothing until the next broadcast — send one
  // immediately so it doesn't wait for the Host's next action.
  broadcastState();
}

function handleHostRoomError(message) {
  $('host-lobby-error').hidden = false;
  $('host-lobby-error').textContent = message;
}

$('btn-copy-code').addEventListener('click', () => {
  if (!room) return;
  navigator.clipboard?.writeText(room.code).then(() => {
    const btn = $('btn-copy-code');
    const original = btn.textContent;
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = original; }, 1500);
  }).catch(() => { /* clipboard permission denied — code is visible on screen anyway */ });
});

$('btn-start-game').addEventListener('click', () => {
  startGame(game);
  markCurrentPuzzleUsed();
  hostAnswerRevealed = false;
  renderHostPanel();
  showScreen('screen-host-panel');
  broadcastState();
});

// ==================================================================
// HOST CONTROL PANEL
// ==================================================================
function renderHostPanel() {
  const puzzle = game.puzzle;
  $('host-target').hidden = !game.targetScore;
  if (game.targetScore) $('host-target').textContent = `First to ${game.targetScore}`;
  $('host-room-code').textContent = room ? room.code : '';
  $('host-peers').textContent = peerCount > 0 ? `${peerCount} connected` : 'Display not connected';
  $('host-score-a').textContent = game.teams.a.score;
  $('host-score-b').textContent = game.teams.b.score;
  $('host-answer').textContent = puzzle ? puzzle.answer : '';
  $('host-answer-card').classList.toggle('blurred', !!puzzle && !hostAnswerRevealed);
  $('host-card-image').src = puzzle ? puzzle.image : '';
  $('host-card-wrap').classList.toggle('blurred', !!puzzle && !puzzle.imageRevealed);
  renderTiles($('host-tiles'), maskedAnswer(puzzle));
  $('btn-reveal-letter').hidden = !game.hintsEnabled;
  $('award-a-name').textContent = game.teams.a.name;
  $('award-b-name').textContent = game.teams.b.name;

  updateTimerDisplay($('host-timer'), timerRemainingMs(game, Date.now()), !!game.timerSeconds);
  $('btn-start-timer').disabled = !game.timerSeconds || game.timerStatus === TIMER_STATUS.RUNNING;
}

function afterHostAction() {
  markCurrentPuzzleUsed();
  hostAnswerRevealed = false;
  if (game.phase === PHASE.GAMEOVER) {
    renderGameOver();
    showScreen('screen-gameover');
  } else {
    renderHostPanel();
  }
  broadcastState();
}

$('btn-reveal-letter').addEventListener('click', () => {
  if (revealLetter(game)) renderHostPanel();
  broadcastState();
});

$('host-card-wrap').addEventListener('click', () => {
  if (revealImage(game)) {
    renderHostPanel();
    broadcastState();
  }
});

// Host-only reveal, no network involved — the Display never receives the
// raw answer regardless of this toggle (see redactState).
$('host-answer-card').addEventListener('click', () => {
  if (!game.puzzle || hostAnswerRevealed) return;
  hostAnswerRevealed = true;
  renderHostPanel();
});

$('btn-start-timer').addEventListener('click', () => {
  if (startTimer(game, Date.now())) {
    renderHostPanel();
    broadcastState();
  }
});

// The Host's clock is the only authority on timer expiry. Both roles
// otherwise just repaint their own countdown digits every tick from their
// own clock — nothing is pushed over the network except when the game
// state actually changes (timer started, or a puzzle dealt). See the tick
// interval below.

$('btn-skip').addEventListener('click', () => {
  skipPuzzle(game);
  afterHostAction();
});

$('btn-award-a').addEventListener('click', () => {
  awardPoint(game, 'a');
  afterHostAction();
});

$('btn-award-b').addEventListener('click', () => {
  awardPoint(game, 'b');
  afterHostAction();
});

// ==================================================================
// GAME OVER (host)
// ==================================================================
function renderGameOver() {
  const { a, b } = game.teams;
  if (role === 'single') {
    $('winner-title').textContent = `You solved ${a.score}!`;
    const scores = $('final-scores');
    scores.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = `Cards solved: ${a.score}`;
    scores.appendChild(span);
    return;
  }
  $('winner-title').textContent = game.winner == null
    ? "It's a draw!"
    : `${game.teams[game.winner].name} wins!`;
  const scores = $('final-scores');
  scores.innerHTML = '';
  for (const t of [a, b]) {
    const span = document.createElement('span');
    span.textContent = `${t.name}: ${t.score}`;
    scores.appendChild(span);
  }
}

$('btn-play-again').addEventListener('click', () => {
  const teamNames = role === 'single' ? { a: 'Solved', b: 'Skipped' } : settings.teamNames;
  const nextGame = createGameFromUnusedCards({ ...settings, teamNames });
  if (!nextGame) return;
  game = nextGame;
  startGame(game);
  markCurrentPuzzleUsed();
  if (role === 'single') {
    singleAnswerVisible = false;
    renderSinglePanel();
    showScreen('screen-single-panel');
  } else {
    hostAnswerRevealed = false;
    renderHostPanel();
    showScreen('screen-host-panel');
    broadcastState();
  }
});

// ==================================================================
// SINGLE PLAYER
// ==================================================================
function renderSinglePanel() {
  const puzzle = game.puzzle;
  $('single-target').hidden = !game.targetScore;
  if (game.targetScore) $('single-target').textContent = `Goal ${game.targetScore}`;
  $('single-progress').textContent = `Solved ${game.teams.a.score}`;
  $('single-card-image').src = puzzle ? puzzle.image : '';
  $('single-card-wrap').classList.toggle('blurred', !!puzzle && !puzzle.imageRevealed);
  renderTiles($('single-tiles'), maskedAnswer(puzzle));
  $('btn-single-hint').hidden = !game.hintsEnabled;

  $('single-answer-card').hidden = !singleAnswerVisible;
  $('single-answer').textContent = singleAnswerVisible && puzzle ? puzzle.answer : '';

  updateTimerDisplay($('single-timer'), timerRemainingMs(game, Date.now()), !!game.timerSeconds);
  $('btn-single-start-timer').disabled = !game.timerSeconds || game.timerStatus === TIMER_STATUS.RUNNING;
}

function afterSingleAction() {
  markCurrentPuzzleUsed();
  singleAnswerVisible = false;
  const input = $('single-guess-input');
  input.value = '';
  input.classList.remove('correct', 'incorrect');
  if (game.phase === PHASE.GAMEOVER) {
    renderGameOver();
    showScreen('screen-gameover');
  } else {
    renderSinglePanel();
  }
}

$('btn-single-hint').addEventListener('click', () => {
  if (revealLetter(game)) renderSinglePanel();
});

$('single-card-wrap').addEventListener('click', () => {
  if (revealImage(game)) renderSinglePanel();
});

$('btn-single-show-answer').addEventListener('click', () => {
  singleAnswerVisible = true;
  renderSinglePanel();
});

$('btn-single-start-timer').addEventListener('click', () => {
  if (startTimer(game, Date.now())) renderSinglePanel();
});

$('btn-single-skip').addEventListener('click', () => {
  skipPuzzle(game);
  afterSingleAction();
});

// Auto-validated instead of a self-judged "Got It" tap: the typed guess is
// checked against puzzle.answer, so a correct guess is the only way to
// score. A wrong guess shakes the input and lets the player retry — no
// penalty, no advance.
$('single-guess-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!game || game.phase !== PHASE.PLAYING || !game.puzzle) return;
  const input = $('single-guess-input');
  const guess = input.value;
  if (!guess.trim()) return;
  if (checkGuess(game.puzzle.answer, guess)) {
    awardPoint(game, 'a');
    afterSingleAction();
  } else {
    input.classList.remove('correct', 'incorrect');
    void input.offsetWidth; // restart the shake animation on repeated wrong guesses
    input.classList.add('incorrect');
  }
});

// ==================================================================
// DISPLAY
// ==================================================================
function resetDisplayView() {
  $('display-name-a').textContent = settings.teamNames.a;
  $('display-name-b').textContent = settings.teamNames.b;
  $('display-score-a').textContent = '0';
  $('display-score-b').textContent = '0';
  $('display-target').hidden = true;
  $('display-waiting').hidden = false;
  $('display-playing').hidden = true;
  $('display-gameover').hidden = true;
}

function handleDisplayState(state, hostNow) {
  game = state; // so the shared tick loop below can keep the timer ticking between snapshots
  clockOffset = (hostNow ?? Date.now()) - Date.now();

  const prevA = Number($('display-score-a').textContent) || 0;
  const prevB = Number($('display-score-b').textContent) || 0;

  $('display-name-a').textContent = state.teams.a.name;
  $('display-name-b').textContent = state.teams.b.name;
  $('display-score-a').textContent = state.teams.a.score;
  $('display-score-b').textContent = state.teams.b.score;
  if (state.teams.a.score > prevA) bumpPlaque('a');
  if (state.teams.b.score > prevB) bumpPlaque('b');

  $('display-target').hidden = !state.targetScore;
  if (state.targetScore) $('display-target').textContent = `First to ${state.targetScore}`;

  const waiting = $('display-waiting');
  const playing = $('display-playing');
  const over = $('display-gameover');
  const timerEl = $('display-timer');

  if (state.phase === PHASE.PLAYING && state.puzzle) {
    waiting.hidden = true;
    playing.hidden = false;
    over.hidden = true;
    $('display-card-image').src = state.puzzle.image;
    $('display-card-wrap').classList.toggle('blurred', !state.puzzle.imageRevealed);
    renderTiles($('display-tiles'), state.puzzle.masked);
    updateTimerDisplay(timerEl, timerRemainingMs(state, Date.now() + clockOffset), !!state.timerSeconds);
  } else if (state.phase === PHASE.GAMEOVER) {
    waiting.hidden = true;
    playing.hidden = true;
    over.hidden = false;
    $('display-winner-title').textContent = state.winner == null
      ? "It's a draw!"
      : `${state.teams[state.winner].name} wins!`;
  } else {
    waiting.hidden = false;
    playing.hidden = true;
    over.hidden = true;
  }
}

function handleDisplayClose(message) {
  $('home-error').hidden = false;
  $('home-error').textContent = message;
  showScreen('screen-home');
}

// ==================================================================
// SHARED TICK — repaints the countdown every 250ms on whichever role is
// active. Only the Host's tick can mutate state (checkTimerExpired); the
// Display only ever repaints from the last snapshot + its clock offset.
// ==================================================================
setInterval(() => {
  if (!game || game.phase !== PHASE.PLAYING) return;

  if (role === 'host') {
    if (game.timerSeconds && checkTimerExpired(game, Date.now())) {
      afterHostAction();
    } else {
      updateTimerDisplay($('host-timer'), timerRemainingMs(game, Date.now()), !!game.timerSeconds);
    }
  } else if (role === 'single') {
    if (game.timerSeconds && checkTimerExpired(game, Date.now())) {
      afterSingleAction();
    } else {
      updateTimerDisplay($('single-timer'), timerRemainingMs(game, Date.now()), !!game.timerSeconds);
    }
  } else if (role === 'display') {
    updateTimerDisplay($('display-timer'), timerRemainingMs(game, Date.now() + clockOffset), !!game.timerSeconds);
  }
}, 250);

showScreen('screen-home');
