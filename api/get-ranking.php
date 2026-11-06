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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    respondJson(405, [
        'success' => false,
        'message' => 'Método não permitido. Utilize GET.',
    ]);
}

$gameMode = $_GET['mode'] ?? 'infinite';

if (!is_string($gameMode)) {
    respondJson(400, [
        'success' => false,
        'message' => 'O parâmetro mode deve ser um texto.',
    ]);
}

require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/ScoreRepository.php';

try {
    $repository = new ScoreRepository(Database::getConnection());
    $ranking = $repository->getTop10($gameMode);

    $rankingWithPosition = [];

    foreach ($ranking as $index => $entry) {
        $rankingWithPosition[] = [
            'position' => $index + 1,
            'id' => (int) $entry['id'],
            'player_name' => $entry['player_name'],
            'game_mode' => $entry['game_mode'],
            'score' => (int) $entry['score'],
            'duration_seconds' => $entry['duration_seconds'] === null
                ? null
                : (int) $entry['duration_seconds'],
            'created_at' => $entry['created_at'],
        ];
    }

    respondJson(200, [
        'success' => true,
        'game_mode' => strtolower(trim($gameMode)),
        'count' => count($rankingWithPosition),
        'ranking' => $rankingWithPosition,
    ]);
} catch (InvalidArgumentException $exception) {
    respondJson(400, [
        'success' => false,
        'message' => $exception->getMessage(),
    ]);
} catch (Throwable $exception) {
    error_log('[TetrisPHP] Falha ao consultar ranking: ' . $exception->getMessage());

    respondJson(500, [
        'success' => false,
        'message' => 'Não foi possível consultar o ranking. Verifique a conexão com o banco de dados.',
    ]);
}
