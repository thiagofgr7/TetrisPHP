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
    <script>
        try {
            document.documentElement.dataset.theme = localStorage.getItem('tetrisphp.theme.v1') === 'light'
                ? 'light'
                : 'dark';
        } catch (error) {
            document.documentElement.dataset.theme = 'dark';
        }
    </script>
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
            <div class="topbar-actions">
                <button id="theme-button" class="pixel-button theme-trigger" type="button"
                    aria-label="Alternar tema claro e escuro" aria-pressed="false">☀ TEMA CLARO</button>
                <button id="controls-button" class="pixel-button settings-trigger" type="button">⚙ TECLAS</button>
                <div class="system-status">
                    <span class="status-light" aria-hidden="true"></span>
                    <span id="system-status-text">POWER ON</span>
                </div>
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
                    <div class="panel-box hold-box">
                        <h2>PEÇA GUARDADA</h2>
                        <div class="preview-frame">
                            <canvas id="hold-canvas" width="120" height="100" aria-label="Peça guardada para uso posterior"></canvas>
                        </div>
                        <p id="hold-status" class="hold-status">HOLD DISPONÍVEL</p>
                    </div>

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
                            <span>TEMPO</span>
                            <strong id="time-value">00:00</strong>
                        </div>
                        <div class="stat-row">
                            <span>DIFICULDADE</span>
                            <strong id="level-value">01</strong>
                        </div>
                        <div class="stat-row">
                            <span>ÚLTIMA JOGADA</span>
                            <strong id="clear-value">---</strong>
                        </div>
                    </div>

                    <div class="panel-box mode-box">
                        <h2>MODO DE JOGO</h2>
                        <p>INFINITE<br><span>30S / MAX LEVEL 10</span></p>
                    </div>
                </aside>

                <div class="board-column">
                    <div class="board-heading">
                        <span>GAME SCREEN</span>
                        <span id="game-status" class="game-status">AGUARDANDO START</span>
                    </div>

                    <div class="board-frame">
                        <canvas id="game-canvas" width="300" height="600" tabindex="0"
                            aria-label="Tabuleiro de Tetris. Use as teclas configuradas no menu TECLAS para mover, girar e soltar peças."></canvas>

                        <div id="game-overlay" class="game-overlay">
                            <div class="overlay-content">
                                <p class="overlay-kicker">TETRISPHP ARCADE</p>
                                <h2 id="overlay-title">READY?</h2>
                                <p id="overlay-message">MODO INFINITO // PRESSIONE START</p>
                                <form id="score-form" class="score-form" hidden>
                                    <label for="player-name">DIGITE SUAS INICIAIS (1 A 3 LETRAS)</label>
                                    <input id="player-name" name="player_name" type="text" maxlength="3"
                                        minlength="1" pattern="[A-Za-z]{1,3}" autocomplete="off"
                                        autocapitalize="characters" spellcheck="false" required>
                                    <button id="save-score-button" class="pixel-button primary-button" type="submit">SALVAR PONTUAÇÃO</button>
                                </form>
                                <p id="score-save-status" class="score-save-status" role="status" hidden></p>
                                <div id="ranking-result" class="ranking-result" hidden>
                                    <h3>TOP 10 INFINITO</h3>
                                    <ol id="ranking-list"></ol>
                                </div>
                                <button id="start-button" class="pixel-button primary-button" type="button">▶ INICIAR MODO INFINITO</button>
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
                        <div class="key-row"><kbd data-key-label="left">←</kbd><span>MOVER ESQUERDA</span></div>
                        <div class="key-row"><kbd data-key-label="right">→</kbd><span>MOVER DIREITA</span></div>
                        <div class="key-row"><kbd data-key-label="down">↓</kbd><span>DESCER</span></div>
                        <div class="key-row"><kbd data-key-label="rotate">↑</kbd><span>GIRAR</span></div>
                        <div class="key-row"><kbd data-key-label="drop">SPACE</kbd><span>QUEDA RÁPIDA</span></div>
                        <div class="key-row"><kbd data-key-label="hold">C</kbd><span>GUARDAR PEÇA</span></div>
                        <div class="key-row"><kbd data-key-label="pause">P</kbd><span>PAUSAR</span></div>
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

            <section id="controls-overlay" class="game-overlay settings-overlay" hidden>
                <div class="overlay-content settings-content" role="dialog" aria-modal="true" aria-labelledby="controls-title">
                    <p class="overlay-kicker">PLAYER SETTINGS</p>
                    <h2 id="controls-title">CONFIGURAR TECLAS</h2>
                    <p id="controls-feedback" class="controls-feedback" aria-live="polite">
                        SELECIONE UMA AÇÃO E PRESSIONE A NOVA TECLA.
                    </p>
                    <div class="control-bindings">
                        <button type="button" class="bind-button" data-bind-action="left">
                            <span>MOVER ESQUERDA</span><kbd data-key-label="left">←</kbd>
                        </button>
                        <button type="button" class="bind-button" data-bind-action="right">
                            <span>MOVER DIREITA</span><kbd data-key-label="right">→</kbd>
                        </button>
                        <button type="button" class="bind-button" data-bind-action="down">
                            <span>DESCER</span><kbd data-key-label="down">↓</kbd>
                        </button>
                        <button type="button" class="bind-button" data-bind-action="rotate">
                            <span>GIRAR</span><kbd data-key-label="rotate">↑</kbd>
                        </button>
                        <button type="button" class="bind-button" data-bind-action="drop">
                            <span>QUEDA RÁPIDA</span><kbd data-key-label="drop">SPACE</kbd>
                        </button>
                        <button type="button" class="bind-button" data-bind-action="hold">
                            <span>GUARDAR PEÇA</span><kbd data-key-label="hold">C</kbd>
                        </button>
                        <button type="button" class="bind-button" data-bind-action="pause">
                            <span>PAUSAR</span><kbd data-key-label="pause">P</kbd>
                        </button>
                    </div>
                    <div class="settings-actions">
                        <button id="reset-controls-button" class="pixel-button" type="button">RESTAURAR PADRÕES</button>
                        <button id="close-controls-button" class="pixel-button primary-button" type="button">FECHAR</button>
                    </div>
                </div>
            </section>

            <section class="touch-controls" aria-label="Controles para toque">
                <button type="button" data-action="left" aria-label="Mover para esquerda">◀</button>
                <button type="button" data-action="down" aria-label="Descer peça">▼</button>
                <button type="button" data-action="rotate" aria-label="Girar peça">↻</button>
                <button type="button" data-action="right" aria-label="Mover para direita">▶</button>
                <button type="button" data-action="drop" aria-label="Queda rápida">DROP</button>
                <button type="button" data-action="hold" aria-label="Guardar peça">HOLD</button>
            </section>

            <footer class="footer">
                <span>INSERT COIN TO PLAY</span>
                <span>© TETRISPHP — RETRO GAME PROJECT</span>
            </footer>
        </main>
    </div>
</body>
</html>
