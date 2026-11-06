(() => {
    'use strict';

    const COLS = 10;
    const ROWS = 20;
    const LEVEL_SPEEDS = [850, 770, 690, 610, 530, 450, 370, 290, 210, 130];
    const INFINITE_LEVEL_DURATION_MS = 30000;
    const MAX_LEVEL = LEVEL_SPEEDS.length;

    // Matrizes 4x4 para as sete peças clássicas.
    const SHAPES = {
      I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      J: [
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      L: [
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      O: [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      S: [
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      T: [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      Z: [
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
    };

    const ROTATION_STATES = ['0', 'R', '2', 'L'];

    // Valores SRS convertidos para coordenadas do tabuleiro (Y positivo para baixo).
    // Os dados de referência usam Y positivo para cima.
    const JLSTZ_KICKS = {
      '0>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
      '1>0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
      '1>2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
      '2>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
      '2>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
      '3>2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
      '3>0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
      '0>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]]
    };

    const I_KICKS = {
      '0>1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
      '1>0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
      '1>2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
      '2>1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
      '2>3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
      '3>2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
      '3>0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
      '0>3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]]
    };

    function getKickTests(type, fromRotation, toRotation) {
      if (type === 'O') {
        return [[0, 0]];
      }

      const table = type === 'I' ? I_KICKS : JLSTZ_KICKS;
      const tests = table[fromRotation + '>' + toRotation] || [];
      return tests.map((offset) => offset.slice());
    }

    function rotateMatrix(matrix, type, direction = 1) {
      if (type === 'O') {
        return matrix.map((row) => row.slice());
      }

      // O SRS usa caixa 3x3 para J/L/S/T/Z e caixa 4x4 para I.
      const size = type === 'I' ? 4 : 3;
      const rotated = Array.from({ length: 4 }, () => Array(4).fill(0));

      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          if (direction >= 0) {
            rotated[x][size - 1 - y] = matrix[y][x];
          } else {
            rotated[size - 1 - x][y] = matrix[y][x];
          }
        }
      }

      return rotated;
    }

    class TetrisGame {
      constructor(canvas, previewCanvas, holdCanvas, onStateChange = () => {}) {
        if (!(canvas instanceof HTMLCanvasElement)) {
          throw new TypeError('O canvas principal do Tetris não foi encontrado.');
        }

        // Mantém compatibilidade com a assinatura antiga (canvas, preview, callback).
        if (typeof holdCanvas === 'function') {
          onStateChange = holdCanvas;
          holdCanvas = null;
        }

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.previewCanvas = previewCanvas;
        this.previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;
        this.holdCanvas = holdCanvas;
        this.holdCtx = holdCanvas ? holdCanvas.getContext('2d') : null;
        this.onStateChange = onStateChange;

        this.grid = this.createEmptyGrid();
        this.bag = [];
        this.currentPiece = null;
        this.nextType = null;

        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.elapsedMs = 0;
        this.lastReportedSecond = -1;
        this.mode = 'infinite';
        this.heldType = null;
        this.holdUsed = false;
        this.lastMoveWasRotation = false;
        this.lastRotationKickIndex = -1;
        this.lastRotation = null;
        this.lastClearType = '';
        this.running = false;
        this.paused = false;
        this.gameOver = false;

        this.lastTime = 0;
        this.accumulator = 0;
        this.frameId = null;

        this.loop = this.loop.bind(this);
        this.render();
        this.notify();
      }

      createEmptyGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
      }

      refillBag() {
        this.bag = Object.keys(SHAPES);

        // Fisher-Yates: cada peça aparece uma vez por conjunto de sete.
        for (let i = this.bag.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
      }

      getNextType() {
        if (this.bag.length === 0) {
          this.refillBag();
        }

        return this.bag.pop();
      }

      createPiece(type) {
        const matrix = SHAPES[type].map((row) => row.slice());

        return {
          type,
          matrix,
          x: Math.floor((COLS - matrix[0].length) / 2),
          y: -1,
          rotation: 0,
          rotationState: ROTATION_STATES[0]
        };
      }

      start(mode = 'infinite') {
        if (mode !== 'infinite') {
          throw new RangeError('Modo de jogo ainda não suportado pelo motor.');
        }

        if (this.frameId !== null) {
          cancelAnimationFrame(this.frameId);
        }

        this.grid = this.createEmptyGrid();
        this.bag = [];
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.elapsedMs = 0;
        this.lastReportedSecond = -1;
        this.mode = mode;
        this.heldType = null;
        this.holdUsed = false;
        this.lastMoveWasRotation = false;
        this.lastRotationKickIndex = -1;
        this.lastRotation = null;
        this.lastClearType = '';
        this.paused = false;
        this.gameOver = false;
        this.running = true;
        this.accumulator = 0;
        this.lastTime = 0;

        this.nextType = this.getNextType();
        this.spawnPiece();
        this.notify();
        this.render();

        if (this.running) {
          this.frameId = requestAnimationFrame(this.loop);
        }
      }

      spawnPiece() {
        const type = this.nextType || this.getNextType();
        this.currentPiece = this.createPiece(type);
        this.nextType = this.getNextType();
        this.holdUsed = false;
        this.lastMoveWasRotation = false;
        this.lastRotationKickIndex = -1;
        this.lastRotation = null;
        this.renderPreview();
        this.renderHold();

        if (this.collides(this.currentPiece, 0, 0)) {
          this.endGame();
        }

        this.notify();
      }

      collides(piece, offsetX = 0, offsetY = 0, matrix = piece.matrix) {
        for (let y = 0; y < matrix.length; y += 1) {
          for (let x = 0; x < matrix[y].length; x += 1) {
            if (!matrix[y][x]) {
              continue;
            }

            const boardX = piece.x + x + offsetX;
            const boardY = piece.y + y + offsetY;

            if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
              return true;
            }

            if (boardY >= 0 && this.grid[boardY][boardX] !== 0) {
              return true;
            }
          }
        }

        return false;
      }

      move(direction) {
        if (!this.canPlay()) {
          return;
        }

        if (!this.collides(this.currentPiece, direction, 0)) {
          this.currentPiece.x += direction;
          this.lastMoveWasRotation = false;
          this.lastRotationKickIndex = -1;
          this.lastRotation = null;
          this.render();
        }
      }

      hold() {
        if (!this.canPlay() || this.holdUsed || !this.currentPiece) {
          return;
        }

        const outgoingType = this.currentPiece.type;

        if (this.heldType === null) {
          this.heldType = outgoingType;
          const incomingType = this.nextType;
          this.currentPiece = this.createPiece(incomingType);
          this.nextType = this.getNextType();
          this.renderPreview();
        } else {
          const incomingType = this.heldType;
          this.heldType = outgoingType;
          this.currentPiece = this.createPiece(incomingType);
        }

        this.holdUsed = true;
        this.lastMoveWasRotation = false;
        this.lastRotationKickIndex = -1;
        this.lastRotation = null;
        this.renderHold();

        if (this.collides(this.currentPiece, 0, 0)) {
          this.endGame();
        }

        this.notify();
        this.render();
      }

      softDrop() {
        if (!this.canPlay()) {
          return;
        }

        this.stepDown(true);
      }

      stepDown(manual = false) {
        if (!this.currentPiece || this.gameOver) {
          return;
        }

        if (!this.collides(this.currentPiece, 0, 1)) {
          // Só uma descida efetiva substitui a rotação como último movimento.
          // Se a peça já está apoiada, a fixação ainda pode concluir um T-Spin.
          if (manual) {
            this.lastMoveWasRotation = false;
            this.lastRotationKickIndex = -1;
            this.lastRotation = null;
          }

          this.currentPiece.y += 1;

          if (manual) {
            this.score += 1;
            this.notify();
          }
        } else {
          this.lockPiece();
        }

        this.render();
      }

      hardDrop() {
        if (!this.canPlay()) {
          return;
        }

        let distance = 0;

        while (!this.collides(this.currentPiece, 0, 1)) {
          this.currentPiece.y += 1;
          distance += 1;
        }

        this.score += distance * 2;
        this.lockPiece();
        this.render();
        this.notify();
      }

      rotate(direction = 1) {
        if (!this.canPlay()) {
          return;
        }

        const step = direction < 0 ? -1 : 1;
        const fromRotation = this.currentPiece.rotation;
        const toRotation = (fromRotation + step + 4) % 4;
        const rotated = rotateMatrix(this.currentPiece.matrix, this.currentPiece.type, step);
        const kicks = getKickTests(this.currentPiece.type, fromRotation, toRotation);

        // Uma tentativa que falha não pode deixar um T-Spin antigo armado.
        this.lastMoveWasRotation = false;
        this.lastRotationKickIndex = -1;
        this.lastRotation = null;

        for (let kickIndex = 0; kickIndex < kicks.length; kickIndex += 1) {
          const [kickX, kickY] = kicks[kickIndex];

          if (!this.collides(this.currentPiece, kickX, kickY, rotated)) {
            this.currentPiece.x += kickX;
            this.currentPiece.y += kickY;
            this.currentPiece.matrix = rotated;
            this.currentPiece.rotation = toRotation;
            this.currentPiece.rotationState = ROTATION_STATES[toRotation];
            this.lastMoveWasRotation = true;
            this.lastRotationKickIndex = kickIndex;
            this.lastRotation = {
              from: fromRotation,
              to: toRotation,
              kickIndex,
              kickX,
              kickY
            };
            this.render();
            return true;
          }
        }

        return false;
      }

      detectTSpin(piece = this.currentPiece) {
        if (
          !piece
          || piece.type !== 'T'
          || !this.lastMoveWasRotation
          || !this.lastRotation
          || this.lastRotation.to !== piece.rotation
        ) {
          return null;
        }

        // No quadro SRS 3x3, o pivô da peça T permanece no centro (1,1).
        const pivot = { x: 1, y: 1 };
        const frontCorners = [
          [0, 1], // 0: frente para cima
          [1, 3], // R: frente para a direita
          [2, 3], // 2: frente para baixo
          [0, 2]  // L: frente para a esquerda
        ];
        const corners = [
          { x: -1, y: -1 },
          { x: 1, y: -1 },
          { x: -1, y: 1 },
          { x: 1, y: 1 }
        ];

        const occupied = corners.map((corner) => {
          const x = piece.x + pivot.x + corner.x;
          const y = piece.y + pivot.y + corner.y;

          // Paredes e piso contam como cantos ocupados; acima do teto não conta.
          if (x < 0 || x >= COLS || y >= ROWS) {
            return true;
          }

          if (y < 0) {
            return false;
          }

          return this.grid[y][x] !== 0;
        });

        if (occupied.filter(Boolean).length < 3) {
          return null;
        }

        const frontCount = frontCorners[piece.rotation]
          .filter((cornerIndex) => occupied[cornerIndex]).length;

        // O quinto teste de kick do SRS promove um Mini a Full.
        return frontCount === 2 || this.lastRotationKickIndex === 4 ? 'full' : 'mini';
      }

      lockPiece() {
        const piece = this.currentPiece;
        const spinType = this.detectTSpin(piece);

        for (let y = 0; y < piece.matrix.length; y += 1) {
          for (let x = 0; x < piece.matrix[y].length; x += 1) {
            if (!piece.matrix[y][x]) {
              continue;
            }

            const boardY = piece.y + y;
            const boardX = piece.x + x;

            if (boardY < 0) {
              this.endGame();
              return;
            }

            this.grid[boardY][boardX] = 1;
          }
        }

        this.clearLines(spinType);
        this.spawnPiece();
      }

      clearLines(spinType = null) {
        const remainingRows = this.grid.filter((row) => row.some((cell) => cell === 0));
        const cleared = ROWS - remainingRows.length;

        if (cleared > 0) {
          while (remainingRows.length < ROWS) {
            remainingRows.unshift(Array(COLS).fill(0));
          }

          this.grid = remainingRows;
        }

        const lineScores = [0, 100, 300, 500, 800];
        const fullTSpinScores = [400, 800, 1200, 1600];
        const miniTSpinScores = [100, 200, 400, 0];

        if (spinType === 'full') {
          this.score += (fullTSpinScores[cleared] || 0) * this.level;
          this.lastClearType = cleared === 0
            ? 'T-SPIN'
            : 'T-SPIN ' + ['ZERO', 'SINGLE', 'DOUBLE', 'TRIPLE'][cleared];
        } else if (spinType === 'mini') {
          this.score += (miniTSpinScores[cleared] || 0) * this.level;
          this.lastClearType = cleared === 0
            ? 'T-SPIN MINI'
            : 'T-SPIN MINI ' + ['ZERO', 'SINGLE', 'DOUBLE', 'TRIPLE'][cleared];
        } else {
          this.score += (lineScores[cleared] || 0) * this.level;
          this.lastClearType = cleared === 0
            ? ''
            : cleared + (cleared === 1 ? ' LINHA' : ' LINHAS');
        }

        this.lines += cleared;
        // No modo infinito, a dificuldade depende do tempo, não das linhas.
        this.notify();
      }

      togglePause() {
        if (!this.running || this.gameOver) {
          return;
        }

        this.paused = !this.paused;
        this.accumulator = 0;
        this.notify();
        this.render();
      }

      canPlay() {
        return this.running && !this.paused && !this.gameOver && this.currentPiece !== null;
      }

      endGame() {
        this.gameOver = true;
        this.running = false;
        this.paused = false;
        this.notify();
        this.render();
      }

      getGravityInterval() {
        return LEVEL_SPEEDS[this.level - 1] || LEVEL_SPEEDS[LEVEL_SPEEDS.length - 1];
      }

      getGhostY() {
        if (!this.currentPiece) {
          return 0;
        }

        let distance = 0;

        while (!this.collides(this.currentPiece, 0, distance + 1)) {
          distance += 1;
        }

        return this.currentPiece.y + distance;
      }

      drawCell(context, x, y, size, ghost = false) {
        // Blocos chapados e quadrados: aparência de pixels de um arcade antigo.
        const left = x * size;
        const top = y * size;
        const inset = 2;

        context.save();

        if (ghost) {
          context.globalAlpha = 0.7;
          context.strokeStyle = '#d8d8d0';
          context.lineWidth = 1;
          context.strokeRect(left + inset + 0.5, top + inset + 0.5, size - inset * 2 - 1, size - inset * 2 - 1);
        } else {
          context.fillStyle = '#eeeeE4';
          context.fillRect(left + inset, top + inset, size - inset * 2, size - inset * 2);
        }

        context.restore();
      }

      drawMatrix(context, matrix, offsetX, offsetY, size, ghost = false) {
        matrix.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value) {
              const boardY = offsetY + y;

              if (boardY >= 0) {
                this.drawCell(context, offsetX + x, boardY, size, ghost);
              }
            }
          });
        });
      }

      render() {
        const context = this.ctx;
        const cellSize = this.canvas.width / COLS;

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.fillStyle = '#050505';
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        context.strokeStyle = '#171717';
        context.lineWidth = 1;

        for (let x = 0; x <= COLS; x += 1) {
          context.beginPath();
          context.moveTo(x * cellSize + 0.5, 0);
          context.lineTo(x * cellSize + 0.5, this.canvas.height);
          context.stroke();
        }

        for (let y = 0; y <= ROWS; y += 1) {
          context.beginPath();
          context.moveTo(0, y * cellSize + 0.5);
          context.lineTo(this.canvas.width, y * cellSize + 0.5);
          context.stroke();
        }

        this.grid.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value) {
              this.drawCell(context, x, y, cellSize);
            }
          });
        });

        if (this.currentPiece) {
          const ghostY = this.getGhostY();
          this.drawMatrix(
            context,
            this.currentPiece.matrix,
            this.currentPiece.x,
            ghostY,
            cellSize,
            true
          );

          this.drawMatrix(
            context,
            this.currentPiece.matrix,
            this.currentPiece.x,
            this.currentPiece.y,
            cellSize,
            false
          );
        }
      }

      renderPiecePreview(type, canvas, context) {
        if (!canvas || !context) {
          return;
        }

        const size = 20;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#050505';
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (!type) {
          return;
        }

        const matrix = SHAPES[type];
        const occupied = [];

        matrix.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value) {
              occupied.push({ x, y });
            }
          });
        });

        if (occupied.length === 0) {
          return;
        }

        const minX = Math.min(...occupied.map((cell) => cell.x));
        const maxX = Math.max(...occupied.map((cell) => cell.x));
        const minY = Math.min(...occupied.map((cell) => cell.y));
        const maxY = Math.max(...occupied.map((cell) => cell.y));

        const pieceWidth = (maxX - minX + 1) * size;
        const pieceHeight = (maxY - minY + 1) * size;
        const startX = (canvas.width - pieceWidth) / 2;
        const startY = (canvas.height - pieceHeight) / 2;

        occupied.forEach((cell) => {
          context.fillStyle = '#f4f4f4';
          context.fillRect(
            startX + (cell.x - minX) * size + 1,
            startY + (cell.y - minY) * size + 1,
            size - 2,
            size - 2
          );
          context.strokeStyle = '#777777';
          context.strokeRect(
            startX + (cell.x - minX) * size + 1.5,
            startY + (cell.y - minY) * size + 1.5,
            size - 3,
            size - 3
          );
        });
      }

      renderPreview() {
        this.renderPiecePreview(this.nextType, this.previewCanvas, this.previewCtx);
      }

      renderHold() {
        this.renderPiecePreview(this.heldType, this.holdCanvas, this.holdCtx);
      }

      notify() {
        const elapsedSeconds = Math.floor(this.elapsedMs / 1000);

        this.onStateChange({
          score: this.score,
          lines: this.lines,
          level: this.level,
          elapsedSeconds,
          mode: this.mode,
          heldType: this.heldType,
          holdUsed: this.holdUsed,
          lastClearType: this.lastClearType,
          running: this.running,
          paused: this.paused,
          gameOver: this.gameOver
        });
      }

      loop(timestamp) {
        if (!this.running) {
          this.frameId = null;
          return;
        }

        if (this.lastTime === 0) {
          this.lastTime = timestamp;
        }

        const delta = Math.min(timestamp - this.lastTime, 100);
        this.lastTime = timestamp;

        if (!this.paused && !this.gameOver) {
          this.elapsedMs += delta;

          const nextLevel = Math.min(
            MAX_LEVEL,
            Math.floor(this.elapsedMs / INFINITE_LEVEL_DURATION_MS) + 1
          );

          if (nextLevel !== this.level) {
            this.level = nextLevel;
            this.accumulator = 0;
            this.notify();
          }

          const elapsedSecond = Math.floor(this.elapsedMs / 1000);
          if (elapsedSecond !== this.lastReportedSecond) {
            this.lastReportedSecond = elapsedSecond;
            this.notify();
          }

          this.accumulator += delta;

          if (this.accumulator >= this.getGravityInterval()) {
            this.accumulator = 0;
            this.stepDown(false);
          }

          this.render();
        }

        if (this.running) {
          this.frameId = requestAnimationFrame(this.loop);
        } else {
          this.frameId = null;
        }
      }
    }

    window.TetrisSRS = Object.freeze({
      rotationStates: ROTATION_STATES.slice(),
      getKickTests,
      rotateMatrix
    });
    window.TetrisGame = TetrisGame;
  })();
