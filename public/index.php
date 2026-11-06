<?php

declare(strict_types=1);

// Calcula o caminho público do projeto a partir do DOCUMENT_ROOT.
 // Isso funciona tanto no servidor embutido do PHP quanto em subpastas do XAMPP.
$projectRoot = realpath(dirname(__DIR__));
$documentRoot = !empty($_SERVER['DOCUMENT_ROOT'])
    ? realpath($_SERVER['DOCUMENT_ROOT'])
    : false;

$basePath = null;

if ($projectRoot !== false && $documentRoot !== false) {
    $projectRootPath = str_replace('\\', '/', $projectRoot);
    $documentRootPath = rtrim(str_replace('\\', '/', $documentRoot), '/');

    if (strcasecmp($projectRootPath, $documentRootPath) === 0) {
        $basePath = '';
    } else {
        $documentRootPrefix = rtrim($documentRootPath, '/') . '/';

        if (stripos($projectRootPath, $documentRootPrefix) === 0) {
            $basePath = '/' . trim(substr($projectRootPath, strlen($documentRootPrefix)), '/');
        }
    }
}

// Fallback para hospedagens com DOCUMENT_ROOT não convencional.
if ($basePath === null) {
    $scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/index.php');
    $scriptDirectory = rtrim(dirname($scriptName), '/');

    if (preg_match('~/public$~i', $scriptDirectory)) {
        $scriptDirectory = substr($scriptDirectory, 0, -7);
    }

    $basePath = $scriptDirectory === '' ? '' : $scriptDirectory;
}

$basePath = rtrim($basePath, '/');
$assetBase = $basePath . '/public/assets';
$apiBase = $basePath . '/api';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#080808">
    <meta name="description" content="TetrisPHP — jogo retrô em preto e branco.">
    <title>TETRIS.PHP — Arcade</title>
    <link rel="stylesheet" href="<?= htmlspecialchars($assetBase, ENT_QUOTES, 'UTF-8') ?>/css/style.css">
    <script>
        window.TETRIS_CONFIG = {
            apiBase: <?= json_encode($apiBase, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>
        };
    </script>
    <script src="<?= htmlspecialchars($assetBase, ENT_QUOTES, 'UTF-8') ?>/js/game.js" defer></script>
    <script src="<?= htmlspecialchars($assetBase, ENT_QUOTES, 'UTF-8') ?>/js/interface.js" defer></script>
</head>
<body>
    <div class="scanlines" aria-hidden="true"></div>

    <div class="page-shell">
        <header class="topbar">
            <a class="brand" href="./" aria-label="TetrisPHP início">
                <span class="brand-mark" aria-hidden="true">T</span>
                <span>TETRIS<span class="brand-dot">.</span>PHP</span>
            </a>
            <div class="system-status">
                <span class="status-light" aria-hidden="true"></span>
                POWER ON
            </div>
        </header>

        <main>
            <section class="intro">
                <p class="eyebrow">8-BIT ARCADE SYSTEM</p>
                <h1>TETRIS<span> .PHP</span></h1>
                <p class="intro-copy">INSERT COIN  •  PLAYER 1</p>
            </section>

            <section class="game-layout" aria-label="Área do jogo">
                <aside class="side-panel side-panel-left">
                    <div class="panel-box next-box">
                        <h2>PRÓXIMA PEÇA</h2>
                        <div class="preview-frame">
                            <canvas id="next-canvas" width="120" height="100" aria-label="Prévia da próxima peça"></canvas>
                        </div>
                    </div>

                    <div class="panel-box stats-box" aria-live="polite">
                        <h2>ESTATÍSTICAS</h2>
                        <div class="stat-row">
                            <span>PONTOS</span>
                            <strong id="score-value">000000</strong>
                        </div>
                        <div class="stat-row">
                            <span>LINHAS</span>
                            <strong id="lines-value">00</strong>
                        </div>
                        <div class="stat-row">
                            <span>NÍVEL</span>
                            <strong id="level-value">01</strong>
                        </div>
                    </div>

                    <div class="panel-box mode-box">
                        <h2>MODO DE JOGO</h2>
                        <p>1 PLAYER<br><span>BLACK &amp; WHITE</span></p>
                    </div>
                </aside>

                <div class="board-column">
                    <div class="board-heading">
                        <span>GAME SCREEN</span>
                        <span id="game-status" class="game-status">AGUARDANDO START</span>
                    </div>

                    <div class="board-frame">
                        <canvas id="game-canvas" width="300" height="600" tabindex="0"
                            aria-label="Tabuleiro de Tetris. Use as setas para mover, seta para cima para girar e espaço para queda rápida."></canvas>

                        <div id="game-overlay" class="game-overlay">
                            <div class="overlay-content">
                                <p class="overlay-kicker">TETRISPHP ARCADE</p>
                                <h2 id="overlay-title">READY?</h2>
                                <p id="overlay-message">PRESSIONE START PARA JOGAR</p>
                                <button id="start-button" class="pixel-button primary-button" type="button">▶ START GAME</button>
                            </div>
                        </div>
                    </div>

                    <div class="board-footer">
                        <span>1 PLAYER</span>
                        <span>8-BIT DISPLAY</span>
                    </div>
                </div>

                <aside class="side-panel side-panel-right">
                    <div class="panel-box controls-box">
                        <h2>CONTROLES</h2>
                        <div class="key-row"><kbd>←</kbd><span>MOVER ESQUERDA</span></div>
                        <div class="key-row"><kbd>→</kbd><span>MOVER DIREITA</span></div>
                        <div class="key-row"><kbd>↓</kbd><span>DESCER</span></div>
                        <div class="key-row"><kbd>↑</kbd><span>GIRAR</span></div>
                        <div class="key-row"><kbd>SPACE</kbd><span>QUEDA RÁPIDA</span></div>
                        <div class="key-row"><kbd>P</kbd><span>PAUSAR</span></div>
                    </div>

                    <div class="panel-box actions-box">
                        <h2>COMANDOS</h2>
                        <button id="pause-button" class="pixel-button" type="button" disabled>Ⅱ PAUSAR</button>
                        <button id="restart-button" class="pixel-button" type="button">↻ REINICIAR</button>
                    </div>

                    <div class="panel-box build-box">
                        <span class="build-label">SYSTEM</span>
                        <strong>ATARI STYLE</strong>
                        <span class="build-note">POWERED BY<br>TETRISPHP</span>
                    </div>
                </aside>
            </section>

            <section class="touch-controls" aria-label="Controles para toque">
                <button type="button" data-action="left" aria-label="Mover para esquerda">◀</button>
                <button type="button" data-action="down" aria-label="Descer peça">▼</button>
                <button type="button" data-action="rotate" aria-label="Girar peça">↻</button>
                <button type="button" data-action="right" aria-label="Mover para direita">▶</button>
                <button type="button" data-action="drop" aria-label="Queda rápida">DROP</button>
            </section>

            <footer class="footer">
                <span>INSERT COIN TO PLAY</span>
                <span>© TETRISPHP — RETRO GAME PROJECT</span>
            </footer>
        </main>
    </div>
</body>
</html>
