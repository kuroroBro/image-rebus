import { PHASE, createGame, startGame, awardPoint, skipPuzzle } from './game.js';
import { PUZZLES } from './puzzles.js';
import { loadSettings, saveSettings } from './storage.js';
import { hostRoom, joinRoom, normalizeCode } from './room.js';

const $ = (id) => document.getElementById(id);

const SCREENS = [
  'screen-home', 'screen-setup', 'screen-host-lobby',
  'screen-host-panel', 'screen-display', 'screen-gameover',
];

function showScreen(id) {
  for (const s of SCREENS) $(s).hidden = s !== id;
}

// ---------- module state ----------
let settings = loadSettings();
let game = null;        // Host: full state. Display: last redacted snapshot received.
let room = null;        // { code, broadcast, close } (host) or { close } (display)
let role = null;        // 'host' | 'display'
let peerCount = 0;

// ---------- redaction: what the Display is allowed to see ----------
// The Host never sends the raw answer — and never sends `puzzle.id` either,
// since it's a descriptive slug (e.g. "understand") that would spell out
// the answer just as much as the word itself would. `image` is safe as-is:
// it's an opaque filename (card-01.png, see js/puzzles.js), and the picture
// it points to is the puzzle everyone's meant to see, not a secret.
function redactState(state) {
  return {
    phase: state.phase,
    targetScore: state.targetScore,
    teams: state.teams,
    winner: state.winner,
    puzzle: state.puzzle ? { image: state.puzzle.image } : null,
  };
}

function broadcastState() {
  if (room && role === 'host') {
    room.broadcast({ t: 'state', state: redactState(game) });
  }
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

$('btn-host').addEventListener('click', () => {
  $('input-team-a').value = settings.teamNames.a;
  $('input-team-b').value = settings.teamNames.b;
  $('input-target-score').value = String(settings.targetScore || 0);
  $('setup-error').hidden = true;
  showScreen('screen-setup');
});

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

$('btn-start-room').addEventListener('click', () => {
  settings = {
    targetScore: Number($('input-target-score').value),
    teamNames: {
      a: $('input-team-a').value.trim() || 'Team A',
      b: $('input-team-b').value.trim() || 'Team B',
    },
  };
  saveSettings(settings);
  game = createGame(settings, PUZZLES);
  role = 'host';

  $('btn-start-room').disabled = true;
  $('setup-error').hidden = true;
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
  $('host-card-image').src = puzzle ? puzzle.image : '';
  $('award-a-name').textContent = game.teams.a.name;
  $('award-b-name').textContent = game.teams.b.name;
}

function afterHostAction() {
  if (game.phase === PHASE.GAMEOVER) {
    renderGameOver();
    showScreen('screen-gameover');
  } else {
    renderHostPanel();
  }
  broadcastState();
}

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
  game = createGame(settings, PUZZLES);
  startGame(game);
  renderHostPanel();
  showScreen('screen-host-panel');
  broadcastState();
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

function handleDisplayState(state) {
  game = state;

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

  if (state.phase === PHASE.PLAYING && state.puzzle) {
    waiting.hidden = true;
    playing.hidden = false;
    over.hidden = true;
    $('display-card-image').src = state.puzzle.image;
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

showScreen('screen-home');
