'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { chromium } = require('playwright');

const baseURL = process.env.TETRIS_BASE_URL || 'http://127.0.0.1:8000';

test('interface arcade inicia, pausa e retoma uma partida', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    assert.match(await page.title(), /TETRIS\.PHP/i);
    await page.locator('#game-canvas').waitFor({ state: 'visible' });
    await page.locator('#start-button').click();
    await page.waitForFunction(() => {
      const status = document.querySelector('#game-status');
      return status && !/AGUARDANDO START/i.test(status.textContent);
    });

    await page.keyboard.press('p');
    await page.waitForFunction(() => /PAUS/i.test(document.querySelector('#game-status').textContent));
    await page.keyboard.press('p');
    await page.waitForFunction(() => !/PAUS/i.test(document.querySelector('#game-status').textContent));

    assert.deepEqual(pageErrors, []);
  } finally {
    await browser.close();
  }
});

test('menu de controles abre, captura tecla e restaura padrões', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    await page.locator('#controls-button').click();
    const dialog = page.locator('#controls-overlay');
    await dialog.waitFor({ state: 'visible' });

    const rotateBinding = page.locator('[data-bind-action="rotate"]');
    await rotateBinding.click();
    await page.keyboard.press('x');
    await assert.doesNotReject(() => page.waitForFunction(() =>
      JSON.parse(localStorage.getItem('tetrisphp.controls.v1')).rotate === 'KeyX'
    ));

    await page.locator('#reset-controls-button').click();
    await page.waitForFunction(() =>
      JSON.parse(localStorage.getItem('tetrisphp.controls.v1')).rotate === 'ArrowUp'
    );
    await page.locator('#close-controls-button').click();
    await dialog.waitFor({ state: 'hidden' });
  } finally {
    await browser.close();
  }
});

test('layout mobile mantém tabuleiro e controles de toque acessíveis', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.locator('#game-canvas').waitFor({ state: 'visible' });
    await page.locator('.touch-controls').waitFor({ state: 'visible' });
    await page.locator('[data-action="hold"]').click();
    await page.locator('#start-button').click();
    await page.locator('[data-action="hold"]').click();
    await page.locator('#game-canvas').evaluate((canvas) => {
      if (canvas.getBoundingClientRect().width <= 0 || canvas.getBoundingClientRect().height <= 0) {
        throw new Error('Canvas sem dimensões visíveis no layout mobile');
      }
    });
  } finally {
    await browser.close();
  }
});

test('tema claro/escuro persiste e Konami Code alterna paleta colorida', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    await page.locator('#theme-button').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(await page.evaluate(() => localStorage.getItem('tetrisphp.theme.v1')), 'light');

    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');

    const konamiCode = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a', 'Enter'
    ];

    for (const key of konamiCode) {
      await page.keyboard.press(key);
    }

    await page.waitForFunction(() => document.body.classList.contains('is-colorful'));
    assert.equal(await page.locator('#system-status-text').textContent(), 'RAINBOW MODE');
    assert.equal(await page.evaluate(() => localStorage.getItem('tetrisphp.colorful.v1')), 'on');
    assert.match(await page.locator('#game-status').textContent(), /AGUARDANDO START/i);

    for (const key of konamiCode) {
      await page.keyboard.press(key);
    }

    await page.waitForFunction(() => !document.body.classList.contains('is-colorful'));
    assert.equal(await page.evaluate(() => localStorage.getItem('tetrisphp.colorful.v1')), 'off');

    await page.locator('#theme-button').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  } finally {
    await browser.close();
  }
});

test('Time Attack oferece três fases, cronômetro regressivo e pausa', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(baseURL, { waitUntil: 'networkidle' });

    await page.locator('#mode-time-attack-button').click();
    assert.equal(await page.locator('#mode-time-attack-button').getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('#overlay-message').textContent(), /3 FASES DE 1 MINUTO/i);
    assert.equal(await page.locator('#time-value').textContent(), '03:00');

    await page.locator('#start-button').click();
    await page.waitForFunction(() => document.querySelector('#game-status').textContent.includes('FÁCIL // FASE 1/3'));
    await page.waitForTimeout(1100);
    const runningTime = await page.locator('#time-value').textContent();
    assert.notEqual(runningTime, '03:00');

    await page.keyboard.press('p');
    await page.waitForFunction(() => document.querySelector('#game-status').textContent.includes('PAUSADO'));
    const pausedTime = await page.locator('#time-value').textContent();
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('#time-value').textContent(), pausedTime);

    await page.keyboard.press('p');
    await page.waitForFunction(() => document.querySelector('#game-status').textContent.includes('FÁCIL // FASE 1/3'));
  } finally {
    await browser.close();
  }
});
