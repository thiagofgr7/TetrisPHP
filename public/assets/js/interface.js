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
    const gameStatus = document.getElementById('game-status');

    if (!canvas || !window.TetrisGame) {
      console.error('Não foi possível inicializar o jogo: canvas ou motor não encontrado.');
      return;
    }

    let currentState = {
      running: false,
      paused: false,
      gameOver: false,
      score: 0,
      lines: 0,
      level: 1
    };

    const game = new window.TetrisGame(canvas, previewCanvas, updateInterface);

    function formatNumber(value, length) {
      return String(value).padStart(length, '0');
    }

    function updateInterface(state) {
      currentState = state;

      scoreValue.textContent = formatNumber(state.score, 6);
      linesValue.textContent = formatNumber(state.lines, 2);
      levelValue.textContent = formatNumber(state.level, 2);

      pauseButton.disabled = !state.running;
      pauseButton.textContent = state.paused ? '▶ CONTINUAR' : 'Ⅱ PAUSAR';

      if (state.gameOver) {
        gameStatus.textContent = 'GAME OVER';
        overlayTitle.textContent = 'GAME OVER';
        overlayMessage.textContent =
          'PONTOS: ' + formatNumber(state.score, 6) +
          ' — RESULTADO LOCAL, AINDA NÃO ENVIADO AO RANKING';
        startButton.textContent = '↻ JOGAR NOVAMENTE';
        overlay.classList.add('is-visible');
        return;
      }

      if (state.paused) {
        gameStatus.textContent = 'PAUSADO';
        overlayTitle.textContent = 'PAUSED';
        overlayMessage.textContent = 'O JOGO ESTÁ PAUSADO';
        startButton.textContent = '▶ CONTINUAR';
        overlay.classList.add('is-visible');
        return;
      }

      if (state.running) {
        gameStatus.textContent = 'EM JOGO';
        overlay.classList.remove('is-visible');
        return;
      }

      gameStatus.textContent = 'AGUARDANDO START';
      overlayTitle.textContent = 'READY?';
      overlayMessage.textContent = 'PRESSIONE START PARA JOGAR';
      startButton.textContent = '▶ START GAME';
      overlay.classList.add('is-visible');
    }

    function startOrResume() {
      if (currentState.paused) {
        game.togglePause();
      } else if (!currentState.running) {
        game.start();
        canvas.focus();
      }
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

    startButton.addEventListener('click', startOrResume);
    pauseButton.addEventListener('click', () => handleAction('pause'));
    restartButton.addEventListener('click', () => {
      game.start();
      canvas.focus();
    });

    document.addEventListener('keydown', (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

      if (isTyping) {
        return;
      }

      const key = event.key.toLowerCase();

      if (['arrowleft', 'arrowright', 'arrowdown', 'arrowup', ' ', 'p', 'escape', 'enter'].includes(key)) {
        event.preventDefault();
      }

      if (key === 'enter' && (!currentState.running || currentState.paused || currentState.gameOver)) {
        startOrResume();
        return;
      }

      if (key === 'arrowleft') {
        handleAction('left');
      } else if (key === 'arrowright') {
        handleAction('right');
      } else if (key === 'arrowdown') {
        handleAction('down');
      } else if (key === 'arrowup' && !event.repeat) {
        handleAction('rotate');
      } else if (key === ' ' && !event.repeat) {
        handleAction('drop');
      } else if ((key === 'p' || key === 'escape') && !event.repeat) {
        handleAction('pause');
      }
    });

    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        handleAction(button.dataset.action);
        canvas.focus();
      });
    });

    canvas.addEventListener('click', () => canvas.focus());

    updateInterface(currentState);
  });
})();
