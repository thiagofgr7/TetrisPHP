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

test('tabelas JLSTZ e I correspondem aos cinco offsets oficiais nas oito transições', () => {
  const jlstz = {
    '0>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '1>0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    '1>2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    '2>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '2>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    '3>2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '3>0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '0>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]]
  };
  const iPiece = {
    '0>1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
    '1>0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
    '1>2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
    '2>1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
    '2>3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
    '3>2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
    '3>0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
    '0>3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]]
  };

  for (const [transition, expected] of Object.entries(jlstz)) {
    const [from, to] = transition.split('>').map(Number);
    assert.deepEqual(plain(SRS.getKickTests('J', from, to)), expected, 'JLSTZ ' + transition);
    assert.deepEqual(plain(SRS.getKickTests('Z', from, to)), expected, 'Z ' + transition);
  }
  for (const [transition, expected] of Object.entries(iPiece)) {
    const [from, to] = transition.split('>').map(Number);
    assert.deepEqual(plain(SRS.getKickTests('I', from, to)), expected, 'I ' + transition);
  }
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

test('motor percorre os quatro estados nos dois sentidos', () => {
  const clockwise = makeGame('T', 3, 5, 0);
  const clockwiseStates = ['0'];
  for (let index = 0; index < 4; index += 1) {
    assert.equal(clockwise.rotate(1), true);
    clockwiseStates.push(clockwise.currentPiece.rotationState);
  }
  assert.deepEqual(clockwiseStates, ['0', 'R', '2', 'L', '0']);

  const counterClockwise = makeGame('T', 3, 5, 0);
  const counterClockwiseStates = ['0'];
  for (let index = 0; index < 4; index += 1) {
    assert.equal(counterClockwise.rotate(-1), true);
    counterClockwiseStates.push(counterClockwise.currentPiece.rotationState);
  }
  assert.deepEqual(counterClockwiseStates, ['0', 'L', '2', 'R', '0']);
});

test('wall-kicks reais recuperam rotação junto às paredes esquerda e direita', () => {
  // Em R, a caixa da peça pode ficar em x=-1 porque sua coluna esquerda está vazia.
  // Ao girar para 2, o teste básico colide com a parede e o kick +1 é aceito.
  const leftWall = makeGame('T', -1, 5, 1);
  assert.equal(leftWall.collides(leftWall.currentPiece), false);
  assert.equal(leftWall.rotate(1), true);
  assert.equal(leftWall.lastRotationKickIndex, 1);
  assert.equal(leftWall.currentPiece.x, 0);
  assert.equal(leftWall.currentPiece.rotationState, '2');

  // Em L, x=8 ainda cabe; ao girar para 0, a coluna direita sai do tabuleiro.
  // O kick -1 recupera a rotação junto à parede direita.
  const rightWall = makeGame('T', 8, 5, 3);
  assert.equal(rightWall.collides(rightWall.currentPiece), false);
  assert.equal(rightWall.rotate(1), true);
  assert.equal(rightWall.lastRotationKickIndex, 1);
  assert.equal(rightWall.currentPiece.x, 7);
  assert.equal(rightWall.currentPiece.rotationState, '0');
});

test('kick SRS recupera rotação quando o resultado básico atravessaria o piso', () => {
  const game = makeGame('T', 3, 18, 0);
  assert.equal(game.collides(game.currentPiece), false);

  // 0 -> R: os testes 1 e 2 ainda deixam a peça abaixo do piso;
  // o terceiro teste desloca uma linha para cima e permite a rotação.
  assert.equal(game.rotate(1), true);
  assert.equal(game.lastRotationKickIndex, 2);
  assert.equal(game.currentPiece.x, 2);
  assert.equal(game.currentPiece.y, 17);
  assert.equal(game.currentPiece.rotationState, 'R');
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
  assert.deepEqual(plain(game.lastRotation), {
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

test('descida manual cancela T-Spin só quando desloca; bloqueio no piso preserva o spin', () => {
  const moving = makeGame('T', 3, 5, 0);
  moving.lastMoveWasRotation = true;
  moving.lastRotation = { from: 3, to: 0, kickIndex: 0, kickX: 0, kickY: 0 };
  moving.lastRotationKickIndex = 0;
  moving.softDrop();
  assert.equal(moving.currentPiece.y, 6);
  assert.equal(moving.lastMoveWasRotation, false);
  assert.equal(moving.lastRotation, null);
  assert.equal(moving.lastRotationKickIndex, -1);

  const grounded = makeGame('T', 3, 18, 0);
  grounded.lastMoveWasRotation = true;
  grounded.lastRotation = { from: 3, to: 0, kickIndex: 0, kickX: 0, kickY: 0 };
  grounded.lastRotationKickIndex = 0;
  grounded.grid[18][3] = 1;
  grounded.grid[18][5] = 1;
  grounded.softDrop();
  assert.equal(grounded.score, 400);
  assert.equal(grounded.lastClearType, 'T-SPIN');
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

  game.nextType = 'Z';
  game.spawnPiece();
  assert.equal(game.currentPiece.type, 'Z');
  assert.equal(game.holdUsed, false, 'Hold é liberado na próxima peça');

  game.rotate(1);
  game.hold();
  assert.equal(game.heldType, 'Z');
  assert.equal(game.currentPiece.type, 'T');
  assert.equal(game.currentPiece.rotation, 0);
  assert.equal(game.currentPiece.rotationState, '0');
  assert.equal(game.lastRotation, null);
});
