'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const drawContext = {
  clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {},
  stroke() {}, save() {}, restore() {}, strokeRect() {}
};

class MockCanvas {
  constructor() {
    this.width = 300;
    this.height = 600;
  }

  getContext() {
    return drawContext;
  }
}

const sourcePath = path.join(__dirname, '..', 'public', 'assets', 'js', 'game.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const sandbox = {
  window: {},
  HTMLCanvasElement: MockCanvas,
  requestAnimationFrame: () => 1,
  cancelAnimationFrame() {},
  Math,
  Object,
  Array,
  TypeError,
  RangeError
};

vm.runInNewContext(source, sandbox, { filename: sourcePath });

const TetrisGame = sandbox.window.TetrisGame;
const SRS = sandbox.window.TetrisSRS;

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeGame(type = 'T', x = 3, y = 5, rotation = 0) {
  const game = new TetrisGame(new MockCanvas());
  game.running = true;
  game.currentPiece = game.createPiece(type);
  game.currentPiece.x = x;
  game.currentPiece.y = y;

  let matrix = game.currentPiece.matrix;
  for (let index = 0; index < rotation; index += 1) {
    matrix = SRS.rotateMatrix(matrix, type, 1);
  }

  game.currentPiece.matrix = matrix;
  game.currentPiece.rotation = rotation;
  game.currentPiece.rotationState = SRS.rotationStates[rotation];
  return game;
}

function cells(matrix, x, y) {
  const result = [];
  matrix.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      if (value) result.push({ x: x + columnIndex, y: y + rowIndex });
    });
  });
  return result;
}

function key(cell) {
  return cell.x + ',' + cell.y;
}

// Coloca blocos que invalidam cada tentativa anterior sem atingir a peça
// ativa nem qualquer tentativa posterior; assim o índice de kick é determinístico.
function blockBeforeKick(game, direction, targetKickIndex) {
  const piece = game.currentPiece;
  const toRotation = (piece.rotation + direction + 4) % 4;
  const rotated = SRS.rotateMatrix(piece.matrix, piece.type, direction);
  const kicks = plain(SRS.getKickTests(piece.type, piece.rotation, toRotation));
  const currentCells = new Set(cells(piece.matrix, piece.x, piece.y).map(key));
  const candidateSets = kicks.map(([dx, dy]) =>
    new Set(cells(rotated, piece.x + dx, piece.y + dy).map(key))
  );

  for (let index = 0; index < targetKickIndex; index += 1) {
    const laterCells = new Set();
    for (let later = index + 1; later < candidateSets.length; later += 1) {
      candidateSets[later].forEach((cell) => laterCells.add(cell));
    }

    const spot = cells(rotated, piece.x + kicks[index][0], piece.y + kicks[index][1])
      .find((cell) =>
        cell.x >= 0 && cell.x < 10 && cell.y >= 0 && cell.y < 20
        && !currentCells.has(key(cell))
        && !laterCells.has(key(cell))
        && game.grid[cell.y][cell.x] === 0
      );

    assert.ok(spot, 'deve existir uma célula exclusiva para bloquear o kick ' + index);
    game.grid[spot.y][spot.x] = 1;
  }

  return kicks;
}

test('SRS expõe as quatro orientações e as oito transições JLSTZ/I', () => {
  assert.deepEqual(plain(SRS.rotationStates), ['0', 'R', '2', 'L']);

  for (const type of ['J', 'L', 'S', 'T', 'Z', 'I']) {
    for (const [from, to] of [[0, 1], [1, 0], [1, 2], [2, 1], [2, 3], [3, 2], [3, 0], [0, 3]]) {
      assert.equal(SRS.getKickTests(type, from, to).length, 5, type + ' ' + from + '>' + to);
    }
  }

  assert.deepEqual(plain(SRS.getKickTests('J', 0, 1)), [
    [0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]
  ]);
  assert.deepEqual(plain(SRS.getKickTests('I', 0, 1)), [
    [0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]
  ]);
  assert.deepEqual(plain(SRS.getKickTests('I', 1, 2)), [
    [0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]
  ]);
  assert.deepEqual(plain(SRS.getKickTests('O', 0, 1)), [[0, 0]]);
});

test('matrizes JLSTZ usam caixa 3x3 e I usa caixa 4x4', () => {
  const t = makeGame('T').currentPiece.matrix;
  const i = makeGame('I').currentPiece.matrix;

  const rotatedT = plain(SRS.rotateMatrix(t, 'T', 1));
  assert.deepEqual(rotatedT.slice(0, 3), [
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0]
  ]);
  assert.equal(rotatedT[3].every((value) => value === 0), true);

  const rotatedI = plain(SRS.rotateMatrix(i, 'I', 1));
  assert.deepEqual(rotatedI.map((row) => row[2]), [1, 1, 1, 1]);
});

test('wall-kick para a esquerda e para a direita é aplicado na ordem SRS', () => {
  const leftKick = makeGame('T', 7, 5, 0);
  const leftTests = blockBeforeKick(leftKick, 1, 1);
  assert.deepEqual(leftTests[1], [-1, 0]);
  assert.equal(leftKick.rotate(1), true);
  assert.equal(leftKick.lastRotationKickIndex, 1);
  assert.equal(leftKick.currentPiece.x, 6);
  assert.equal(leftKick.lastRotation.to, 1);

  const rightKick = makeGame('T', 0, 5, 0);
  const rightTests = blockBeforeKick(rightKick, -1, 1);
  assert.deepEqual(rightTests[1], [1, 0]);
  assert.equal(rightKick.rotate(-1), true);
  assert.equal(rightKick.lastRotationKickIndex, 1);
  assert.equal(rightKick.currentPiece.x, 1);
  assert.equal(rightKick.currentPiece.rotationState, 'L');
});

test('kick vertical SRS recupera rotação perto do piso', () => {
  const game = makeGame('T', 0, 17, 1);
  const tests = blockBeforeKick(game, -1, 3);
  assert.deepEqual(tests[3], [0, -2]);

  assert.equal(game.rotate(-1), true);
  assert.equal(game.lastRotationKickIndex, 3);
  assert.equal(game.currentPiece.y, 15);
  assert.equal(game.currentPiece.rotationState, '0');
  assert.equal(game.collides(game.currentPiece), false);
});

test('peça I utiliza tabela própria e completa a rotação', () => {
  const game = makeGame('I', 3, 5, 0);
  assert.equal(game.rotate(1), true);
  assert.equal(game.currentPiece.rotationState, 'R');
  assert.deepEqual(
    plain(game.currentPiece.matrix.map((row) => row[2])),
    [1, 1, 1, 1]
  );
  assert.equal(game.lastRotationKickIndex, 0);
});

test('peça O mantém a geometria e não aplica deslocamento de kick', () => {
  const game = makeGame('O', 3, 5, 0);
  const original = plain(game.currentPiece.matrix);
  const originalX = game.currentPiece.x;
  const originalY = game.currentPiece.y;

  assert.equal(game.rotate(1), true);
  assert.deepEqual(plain(game.currentPiece.matrix), original);
  assert.equal(game.currentPiece.x, originalX);
  assert.equal(game.currentPiece.y, originalY);
  assert.equal(game.currentPiece.rotationState, 'R');
  assert.deepEqual(game.lastRotation, {
    from: 0, to: 1, kickIndex: 0, kickX: 0, kickY: 0
  });
});

test('rotação falha quando todos os cinco kicks colidem e limpa metadados de spin', () => {
  const game = makeGame('T', 3, 5, 0);
  game.lastMoveWasRotation = true;
  game.lastRotation = { from: 3, to: 0, kickIndex: 4, kickX: 1, kickY: -2 };
  game.lastRotationKickIndex = 4;
  game.grid = Array.from({ length: 20 }, () => Array(10).fill(1));

  assert.equal(game.rotate(1), false);
  assert.equal(game.lastMoveWasRotation, false);
  assert.equal(game.lastRotation, null);
  assert.equal(game.lastRotationKickIndex, -1);
  assert.equal(game.detectTSpin(), null);
});

test('T-Spin Mini e Full são classificados pelos cantos frontais SRS', () => {
  const mini = makeGame('T', 3, 5, 0);
  mini.lastMoveWasRotation = true;
  mini.lastRotation = { from: 3, to: 0, kickIndex: 0, kickX: 0, kickY: 0 };
  mini.lastRotationKickIndex = 0;
  mini.grid[5][3] = 1;
  mini.grid[7][3] = 1;
  mini.grid[7][5] = 1;
  assert.equal(mini.detectTSpin(), 'mini');

  const full = makeGame('T', 3, 5, 0);
  full.lastMoveWasRotation = true;
  full.lastRotation = { from: 3, to: 0, kickIndex: 0, kickX: 0, kickY: 0 };
  full.lastRotationKickIndex = 0;
  full.grid[5][3] = 1;
  full.grid[5][5] = 1;
  full.grid[7][3] = 1;
  assert.equal(full.detectTSpin(), 'full');
});

test('quinto teste de kick promove T-Spin Mini a Full', () => {
  const game = makeGame('T', 3, 5, 0);
  game.lastMoveWasRotation = true;
  game.lastRotation = { from: 3, to: 0, kickIndex: 4, kickX: 1, kickY: -2 };
  game.lastRotationKickIndex = 4;
  game.grid[5][3] = 1;
  game.grid[7][3] = 1;
  game.grid[7][5] = 1;

  assert.equal(game.detectTSpin(), 'full');
});

test('Hold preserva o fluxo e reseta a orientação/metadados da peça recebida', () => {
  const game = makeGame('T', 3, 5, 0);
  game.nextType = 'I';
  assert.equal(game.rotate(1), true);

  game.hold();
  assert.equal(game.heldType, 'T');
  assert.equal(game.currentPiece.type, 'I');
  assert.equal(game.currentPiece.rotation, 0);
  assert.equal(game.currentPiece.rotationState, '0');
  assert.equal(game.holdUsed, true);
  assert.equal(game.lastMoveWasRotation, false);
  assert.equal(game.lastRotation, null);

  const heldType = game.heldType;
  game.hold();
  assert.equal(game.heldType, heldType, 'Hold só pode ser usado uma vez por peça');
});
