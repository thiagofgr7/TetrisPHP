<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respondJson(int $statusCode, array $payload): void
{
    http_response_code($statusCode);

    echo json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respondJson(405, [
        'success' => false,
        'message' => 'Método não permitido. Utilize POST.',
    ]);
}

$contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
if ($contentType !== 'application/json') {
    respondJson(415, [
        'success' => false,
        'message' => 'Content-Type deve ser application/json.',
    ]);
}

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody, true);

if (!is_array($payload) || json_last_error() !== JSON_ERROR_NONE) {
    respondJson(400, [
        'success' => false,
        'message' => 'Corpo JSON inválido.',
    ]);
}

$playerName = $payload['player_name'] ?? null;
$gameMode = $payload['game_mode'] ?? null;
$score = $payload['score'] ?? null;
$durationSeconds = $payload['duration_seconds'] ?? null;

if (!is_string($playerName) || !is_string($gameMode)) {
    respondJson(422, [
        'success' => false,
        'message' => 'Informe player_name e game_mode como textos.',
    ]);
}

if (!is_int($score) || $score < 0 || $score > 4294967295) {
    respondJson(422, [
        'success' => false,
        'message' => 'score deve ser um número inteiro entre 0 e 4294967295.',
    ]);
}

if (
    $durationSeconds !== null
    && (
        !is_int($durationSeconds)
        || $durationSeconds < 0
        || $durationSeconds > 4294967295
    )
) {
    respondJson(422, [
        'success' => false,
        'message' => 'duration_seconds deve ser null ou um inteiro entre 0 e 4294967295.',
    ]);
}

require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/ScoreRepository.php';

try {
    $repository = new ScoreRepository(Database::getConnection());

    $scoreId = $repository->saveScore(
        $playerName,
        $gameMode,
        $score,
        $durationSeconds
    );

    respondJson(201, [
        'success' => true,
        'message' => 'Pontuação registrada com sucesso.',
        'id' => $scoreId,
    ]);
} catch (InvalidArgumentException $exception) {
    respondJson(422, [
        'success' => false,
        'message' => $exception->getMessage(),
    ]);
} catch (Throwable $exception) {
    error_log('[TetrisPHP] Falha ao salvar pontuação: ' . $exception->getMessage());

    respondJson(500, [
        'success' => false,
        'message' => 'Não foi possível registrar a pontuação. Verifique a conexão com o banco de dados.',
    ]);
}
