(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const previewCanvas = document.getElementById('next-canvas');
    const overlay = document.getElementById('game-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayMessage = document.getElementById('overlay-message');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const restartButton = document.getElementById('restart-button');

    const scoreValue = document.getElementById('score-value');
    const linesValue = document.getElementById('lines-value');
    const levelValue = document.getElementById('level-value');
    const timeValue = document.getElementById('time-value');
    const gameStatus = document.getElementById('game-status');

    const scoreForm = document.getElementById('score-form');
    const playerNameInput = document.getElementById('player-name');
    const saveScoreButton = document.getElementById('save-score-button');
    const scoreSaveStatus = document.getElementById('score-save-status');
    const rankingResult = document.getElementById('ranking-result');
    const rankingList = document.getElementById('ranking-list');

    const controlsButton = document.getElementById('controls-button');
    const controlsOverlay = document.getElementById('controls-overlay');
    const controlsFeedback = document.getElementById('controls-feedback');
    const closeControlsButton = document.getElementById('close-controls-button');
    const resetControlsButton = document.getElementById('reset-controls-button');

    if (!canvas || !window.TetrisGame) {
      console.error('Não foi possível inicializar o jogo: canvas ou motor não encontrado.');
      return;
    }

    const DEFAULT_BINDINGS = Object.freeze({
      left: 'ArrowLeft',
      right: 'ArrowRight',
      down: 'ArrowDown',
      rotate: 'ArrowUp',
      drop: 'Space',
      pause: 'KeyP'
    });
    const STORAGE_KEY = 'tetrisphp.controls.v1';
    const ACTION_LABELS = {
      left: 'MOVER ESQUERDA',
      right: 'MOVER DIREITA',
      down: 'DESCER',
      rotate: 'GIRAR',
      drop: 'QUEDA RÁPIDA',
      pause: 'PAUSAR'
    };
    const BLOCKED_CODES = new Set([
      'Tab', 'Escape', 'Enter', 'NumpadEnter', 'Backspace', 'Delete',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'ContextMenu', 'CapsLock', 'NumLock', 'ScrollLock',
      'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
      'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'
    ]);

    let currentState = {
      running: false,
      paused: false,
      gameOver: false,
      score: 0,
      lines: 0,
      level: 1,
      elapsedSeconds: 0,
      mode: 'infinite'
    };
    let gameOverHandled = false;
    let scoreSubmitted = false;
    let listeningAction = null;
    let bindings = loadBindings();

    const apiBase = String(window.TETRIS_CONFIG?.apiBase || '/api').replace(/\/+$/, '');
    const game = new window.TetrisGame(canvas, previewCanvas, updateInterface);

    function formatNumber(value, length) {
      return String(value).padStart(length, '0');
    }

    function formatTime(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return formatNumber(minutes, 2) + ':' + formatNumber(seconds, 2);
    }

    function loadBindings() {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (!stored || typeof stored !== 'object') {
          return { ...DEFAULT_BINDINGS };
        }

        const candidate = {};
        const used = new Set();

        for (const action of Object.keys(DEFAULT_BINDINGS)) {
          const code = stored[action];
          if (typeof code !== 'string' || !isAllowedCode(code) || used.has(code)) {
            return { ...DEFAULT_BINDINGS };
          }

          candidate[action] = code;
          used.add(code);
        }

        return candidate;
      } catch (error) {
        return { ...DEFAULT_BINDINGS };
      }
    }

    function persistBindings() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
        controlsFeedback.textContent = 'CONFIGURAÇÃO SALVA NESTE NAVEGADOR.';
      } catch (error) {
        controlsFeedback.textContent = 'NÃO FOI POSSÍVEL SALVAR. O NAVEGADOR BLOQUEOU O ARMAZENAMENTO.';
      }
    }

    function isAllowedCode(code) {
      return !BLOCKED_CODES.has(code)
        && !/^F(?:[1-9]|1[0-2])$/.test(code)
        && !/^(?:Shift|Control|Alt|Meta)/.test(code);
    }

    function describeKey(code) {
      if (code === 'Space') return 'SPACE';
      if (code.startsWith('Arrow')) {
        return {
          ArrowLeft: '←',
          ArrowRight: '→',
          ArrowDown: '↓',
          ArrowUp: '↑'
        }[code] || code;
      }
      if (code.startsWith('Key')) return code.slice(3);
      if (code.startsWith('Digit')) return code.slice(5);
      if (code.startsWith('Numpad')) return 'NUM ' + code.slice(6);
      const names = {
        Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']',
        Backslash: '\\', Semicolon: ';', Quote: "'", Backquote: '`',
        Comma: ',', Period: '.', Slash: '/'
      };
      return names[code] || code.toUpperCase();
    }

    function renderBindings() {
      document.querySelectorAll('[data-key-label]').forEach((element) => {
        const action = element.dataset.keyLabel;
        if (bindings[action]) {
          element.textContent = describeKey(bindings[action]);
        }
      });

      document.querySelectorAll('[data-bind-action]').forEach((button) => {
        const action = button.dataset.bindAction;
        const key = button.querySelector('[data-key-label]');
        if (key) {
          key.textContent = describeKey(bindings[action]);
        }

        button.classList.toggle('is-listening', listeningAction === action);
        button.setAttribute('aria-pressed', listeningAction === action ? 'true' : 'false');
      });
    }

    function updateInterface(state) {
      currentState = state;

      scoreValue.textContent = formatNumber(state.score, 6);
      linesValue.textContent = formatNumber(state.lines, 2);
      levelValue.textContent = formatNumber(state.level, 2);
      timeValue.textContent = formatTime(state.elapsedSeconds || 0);

      pauseButton.disabled = !state.running;
      pauseButton.textContent = state.paused ? '▶ CONTINUAR' : 'Ⅱ PAUSAR';

      if (state.gameOver) {
        gameStatus.textContent = 'GAME OVER';
        overlayTitle.textContent = 'FIM DE JOGO';
        overlayMessage.textContent = 'TEMPO: ' + formatTime(state.elapsedSeconds || 0)
          + ' // PONTOS: ' + formatNumber(state.score, 6);

        if (!gameOverHandled) {
          gameOverHandled = true;
          scoreSubmitted = false;
          scoreForm.hidden = false;
          scoreForm.reset();
          scoreSaveStatus.hidden = true;
          scoreSaveStatus.textContent = '';
          rankingResult.hidden = true;
          rankingList.replaceChildren();
          startButton.hidden = true;
          overlay.classList.add('is-visible');
          window.setTimeout(() => playerNameInput.focus(), 0);
        }

        return;
      }

      if (state.paused) {
        gameStatus.textContent = 'PAUSADO';
        overlayTitle.textContent = 'PAUSED';
        overlayMessage.textContent = 'O JOGO ESTÁ PAUSADO';
        scoreForm.hidden = true;
        scoreSaveStatus.hidden = true;
        rankingResult.hidden = true;
        startButton.hidden = false;
        startButton.textContent = '▶ CONTINUAR';
        overlay.classList.add('is-visible');
        return;
      }

      if (state.running) {
        gameStatus.textContent = 'INFINITE // LV ' + formatNumber(state.level, 2);
        overlay.classList.remove('is-visible');
        return;
      }

      gameStatus.textContent = 'AGUARDANDO START';
      overlayTitle.textContent = 'READY?';
      overlayMessage.textContent = 'MODO INFINITO // PRESSIONE START';
      scoreForm.hidden = true;
      scoreSaveStatus.hidden = true;
      rankingResult.hidden = true;
      startButton.hidden = false;
      startButton.textContent = '▶ INICIAR MODO INFINITO';
      overlay.classList.add('is-visible');
    }

    function startOrResume() {
      if (currentState.paused) {
        game.togglePause();
        return;
      }

      if (currentState.gameOver && !scoreSubmitted) {
        return;
      }

      if (!currentState.running) {
        beginInfiniteGame();
      }
    }

    function beginInfiniteGame() {
      gameOverHandled = false;
      scoreSubmitted = false;
      playerNameInput.disabled = false;
      saveScoreButton.disabled = false;
      scoreForm.reset();
      scoreForm.hidden = true;
      scoreSaveStatus.hidden = true;
      rankingResult.hidden = true;
      startButton.hidden = false;
      game.start('infinite');
      canvas.focus();
    }

    function handleAction(action) {
      switch (action) {
        case 'left':
          game.move(-1);
          break;
        case 'right':
          game.move(1);
          break;
        case 'down':
          game.softDrop();
          break;
        case 'rotate':
          game.rotate();
          break;
        case 'drop':
          game.hardDrop();
          break;
        case 'pause':
          game.togglePause();
          break;
        default:
          break;
      }
    }

    async function submitScore(event) {
      event.preventDefault();

      if (scoreSubmitted || !currentState.gameOver) {
        return;
      }

      const playerName = playerNameInput.value.trim().toUpperCase();
      if (!/^[A-Z]{1,3}$/.test(playerName)) {
        scoreSaveStatus.hidden = false;
        scoreSaveStatus.textContent = 'USE DE 1 A 3 LETRAS, SEM NÚMEROS OU SÍMBOLOS.';
        playerNameInput.focus();
        return;
      }

      saveScoreButton.disabled = true;
      playerNameInput.disabled = true;
      scoreSaveStatus.hidden = false;
      scoreSaveStatus.textContent = 'ENVIANDO PONTUAÇÃO...';

      try {
        const response = await fetch(apiBase + '/save-score.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_name: playerName,
            game_mode: 'infinite',
            score: currentState.score,
            duration_seconds: currentState.elapsedSeconds || 0
          })
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Não foi possível salvar a pontuação.');
        }

        scoreSubmitted = true;
        scoreForm.hidden = true;
        scoreSaveStatus.textContent = 'PONTUAÇÃO REGISTRADA. BOA PARTIDA, ' + playerName + '!';
        await loadInfiniteRanking();
        startButton.hidden = false;
        startButton.textContent = '↻ JOGAR NOVAMENTE';
      } catch (error) {
        scoreSaveStatus.textContent = error.message || 'ERRO AO SALVAR. VERIFIQUE O SERVIDOR.';
        playerNameInput.disabled = false;
        saveScoreButton.disabled = false;
        playerNameInput.focus();
      }
    }

    async function loadInfiniteRanking() {
      rankingResult.hidden = false;
      rankingList.replaceChildren();

      try {
        const response = await fetch(apiBase + '/get-ranking.php?mode=infinite', {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Não foi possível carregar o ranking.');
        }

        if (!Array.isArray(result.ranking) || result.ranking.length === 0) {
          const item = document.createElement('li');
          item.textContent = 'AINDA NÃO HÁ PONTUAÇÕES.';
          rankingList.appendChild(item);
          return;
        }

        result.ranking.forEach((entry) => {
          const item = document.createElement('li');
          const player = document.createElement('span');
          const points = document.createElement('strong');
          player.textContent = '#' + entry.position + ' ' + entry.player_name;
          points.textContent = formatNumber(Number(entry.score) || 0, 6);
          item.append(player, points);
          rankingList.appendChild(item);
        });
      } catch (error) {
        const item = document.createElement('li');
        item.textContent = 'RANKING INDISPONÍVEL NESTE MOMENTO.';
        rankingList.appendChild(item);
      }
    }

    function isEditableTarget(target) {
      return target instanceof HTMLElement
        && (target.isContentEditable
          || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    }

    function openControls() {
      if (currentState.running && !currentState.paused) {
        game.togglePause();
      }

      listeningAction = null;
      controlsOverlay.hidden = false;
      controlsOverlay.classList.add('is-visible');
      controlsFeedback.textContent = 'SELECIONE UMA AÇÃO E PRESSIONE A NOVA TECLA.';
      renderBindings();

      const firstBinding = controlsOverlay.querySelector('[data-bind-action]');
      if (firstBinding) firstBinding.focus();
    }

    function closeControls() {
      listeningAction = null;
      controlsOverlay.classList.remove('is-visible');
      controlsOverlay.hidden = true;
      controlsFeedback.textContent = 'SELECIONE UMA AÇÃO E PRESSIONE A NOVA TECLA.';
      renderBindings();
      controlsButton.focus();
    }

    function beginListening(action) {
      listeningAction = action;
      controlsFeedback.textContent = 'PRESSIONE A TECLA PARA: ' + ACTION_LABELS[action]
        + '. ESC CANCELA.';
      renderBindings();
    }

    function captureBinding(event) {
      if (!listeningAction) {
        return false;
      }

      event.preventDefault();

      if (event.code === 'Escape') {
        listeningAction = null;
        controlsFeedback.textContent = 'ALTERAÇÃO CANCELADA.';
        renderBindings();
        return true;
      }

      if (
        !isAllowedCode(event.code)
        || event.ctrlKey
        || event.altKey
        || event.metaKey
      ) {
        controlsFeedback.textContent = 'TECLA RESERVADA. ESCOLHA OUTRA TECLA.';
        return true;
      }

      const conflict = Object.entries(bindings).find(([action, code]) =>
        action !== listeningAction && code === event.code
      );

      if (conflict) {
        controlsFeedback.textContent = 'ESSA TECLA JÁ ESTÁ EM USO: ' + ACTION_LABELS[conflict[0]] + '.';
        return true;
      }

      bindings[listeningAction] = event.code;
      listeningAction = null;
      persistBindings();
      renderBindings();
      return true;
    }

    startButton.addEventListener('click', startOrResume);
    pauseButton.addEventListener('click', () => handleAction('pause'));
    restartButton.addEventListener('click', beginInfiniteGame);
    scoreForm.addEventListener('submit', submitScore);

    controlsButton.addEventListener('click', openControls);
    closeControlsButton.addEventListener('click', closeControls);
    controlsOverlay.addEventListener('click', (event) => {
      if (event.target === controlsOverlay) {
        closeControls();
      }
    });

    document.querySelectorAll('[data-bind-action]').forEach((button) => {
      button.addEventListener('click', () => beginListening(button.dataset.bindAction));
    });

    resetControlsButton.addEventListener('click', () => {
      bindings = { ...DEFAULT_BINDINGS };
      listeningAction = null;
      persistBindings();
      renderBindings();
      controlsFeedback.textContent = 'CONTROLES PADRÃO RESTAURADOS.';
    });

    document.addEventListener('keydown', (event) => {
      if (captureBinding(event)) {
        return;
      }

      if (!controlsOverlay.hidden) {
        if (event.code === 'Escape') {
          event.preventDefault();
          closeControls();
        }
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.code === 'Enter' && (!currentState.running || currentState.paused || currentState.gameOver)) {
        event.preventDefault();
        startOrResume();
        return;
      }

      const action = Object.keys(bindings).find((name) => bindings[name] === event.code);
      if (!action) {
        return;
      }

      event.preventDefault();

      if (event.repeat && ['rotate', 'drop', 'pause'].includes(action)) {
        return;
      }

      handleAction(action);
    });

    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        handleAction(button.dataset.action);
        canvas.focus();
      });
    });

    canvas.addEventListener('click', () => canvas.focus());

    renderBindings();
    updateInterface(currentState);
  });
})();
