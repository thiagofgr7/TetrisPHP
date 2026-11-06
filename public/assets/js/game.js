(() => {
    'use strict';

    const COLS = 10;
    const ROWS = 20;
    const LEVEL_SPEEDS = [850, 770, 690, 610, 530, 450, 370, 290, 210, 130];

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

    class TetrisGame {
      constructor(canvas, previewCanvas, onStateChange = () => {}) {
        if (!(canvas instanceof HTMLCanvasElement)) {
          throw new TypeError('O canvas principal do Tetris não foi encontrado.');
        }

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.previewCanvas = previewCanvas;
        this.previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;
        this.onStateChange = onStateChange;

        this.grid = this.createEmptyGrid();
        this.bag = [];
        this.currentPiece = null;
        this.nextType = null;

        this.score = 0;
        this.lines = 0;
        this.level = 1;
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
          y: -1
        };
      }

      start() {
        if (this.frameId !== null) {
          cancelAnimationFrame(this.frameId);
        }

        this.grid = this.createEmptyGrid();
        this.bag = [];
        this.score = 0;
        this.lines = 0;
        this.level = 1;
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
        this.renderPreview();

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
          this.render();
        }
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

      rotate() {
        if (!this.canPlay()) {
          return;
        }

        const matrix = this.currentPiece.matrix;
        const rotated = matrix[0].map((_, index) =>
          matrix.map((row) => row[index]).reverse()
        );

        // Pequenos deslocamentos laterais ajudam a girar perto das paredes.
        const kicks = [0, -1, 1, -2, 2];

        for (const kick of kicks) {
          if (!this.collides(this.currentPiece, kick, 0, rotated)) {
            this.currentPiece.x += kick;
            this.currentPiece.matrix = rotated;
            this.render();
            return;
          }
        }
      }

      lockPiece() {
        const piece = this.currentPiece;

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

        this.clearLines();
        this.spawnPiece();
      }

      clearLines() {
        const remainingRows = this.grid.filter((row) => row.some((cell) => cell === 0));
        const cleared = ROWS - remainingRows.length;

        if (cleared === 0) {
          return;
        }

        while (remainingRows.length < ROWS) {
          remainingRows.unshift(Array(COLS).fill(0));
        }

        this.grid = remainingRows;

        const lineScores = [0, 100, 300, 500, 800];
        this.score += lineScores[cleared] * this.level;
        this.lines += cleared;
        this.level = Math.min(10, Math.floor(this.lines / 10) + 1);
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

      renderPreview() {
        if (!this.previewCtx || !this.previewCanvas) {
          return;
        }

        const context = this.previewCtx;
        const size = 20;

        context.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        context.fillStyle = '#050505';
        context.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

        if (!this.nextType) {
          return;
        }

        const matrix = SHAPES[this.nextType];
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
        const startX = (this.previewCanvas.width - pieceWidth) / 2;
        const startY = (this.previewCanvas.height - pieceHeight) / 2;

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

      notify() {
        this.onStateChange({
          score: this.score,
          lines: this.lines,
          level: this.level,
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

    window.TetrisGame = TetrisGame;
  })();
