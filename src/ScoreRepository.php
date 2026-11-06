<?php

declare(strict_types=1);

/**
 * Centraliza a persistência e a consulta das pontuações do jogo.
 *
 * O ranking é separado por modalidade: "infinite" ou "time_attack".
 * Todas as consultas usam prepared statements do PDO.
 */
final class ScoreRepository
{
    private const VALID_GAME_MODES = ['time_attack', 'infinite'];
    private const MAX_UNSIGNED_INT = 4294967295;

    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Registra uma pontuação e retorna o ID criado.
     *
     * O nome é normalizado para maiúsculas e aceita de 1 a 3 letras
     * ASCII (A-Z), conforme a regra das iniciais do jogador.
     *
     * @throws InvalidArgumentException Quando os dados forem inválidos.
     * @throws PDOException Quando o MySQL não conseguir executar a operação.
     */
    public function saveScore(
        string $playerName,
        string $gameMode,
        int $score,
        ?int $durationSeconds = null
    ): int {
        $playerName = strtoupper(trim($playerName));

        if (
            strlen($playerName) < 1
            || strlen($playerName) > 3
            || preg_match('/^[A-Z]{1,3}$/', $playerName) !== 1
        ) {
            throw new InvalidArgumentException(
                'O nome do jogador deve conter de 1 a 3 letras (A-Z).'
            );
        }

        $gameMode = strtolower(trim($gameMode));
        $this->validateGameMode($gameMode);

        // Garante valores não negativos antes de persistir no campo UNSIGNED.
        $score = max(0, $score);

        if ($score > self::MAX_UNSIGNED_INT) {
            throw new InvalidArgumentException('A pontuação excede o limite permitido.');
        }

        if ($durationSeconds !== null) {
            $durationSeconds = max(0, $durationSeconds);

            if ($durationSeconds > self::MAX_UNSIGNED_INT) {
                throw new InvalidArgumentException('A duração excede o limite permitido.');
            }
        }

        $sql = '
            INSERT INTO ranking (
                player_name,
                game_mode,
                score,
                duration_seconds
            ) VALUES (
                :player_name,
                :game_mode,
                :score,
                :duration_seconds
            )
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->execute([
            ':player_name' => $playerName,
            ':game_mode' => $gameMode,
            ':score' => $score,
            ':duration_seconds' => $durationSeconds,
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    /**
     * Retorna as 10 maiores pontuações de uma modalidade.
     *
     * Em caso de empate, a pontuação registrada primeiro aparece antes.
     *
     * @return array<int, array<string, mixed>>
     *
     * @throws InvalidArgumentException Quando a modalidade for inválida.
     */
    public function getTop10(string $gameMode = 'infinite'): array
    {
        $gameMode = strtolower(trim($gameMode));
        $this->validateGameMode($gameMode);

        $sql = '
            SELECT
                id,
                player_name,
                game_mode,
                score,
                duration_seconds,
                created_at
            FROM ranking
            WHERE game_mode = :game_mode
            ORDER BY score DESC, created_at ASC, id ASC
            LIMIT 10
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->execute([':game_mode' => $gameMode]);

        return $statement->fetchAll();
    }

    /**
     * Impede que valores externos sejam usados como modalidade de jogo.
     *
     * @throws InvalidArgumentException Quando a modalidade não for suportada.
     */
    private function validateGameMode(string $gameMode): void
    {
        if (!in_array($gameMode, self::VALID_GAME_MODES, true)) {
            throw new InvalidArgumentException('Modalidade de jogo inválida.');
        }
    }
}
