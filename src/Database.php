<?php

declare(strict_types=1);

/**
 * Gerencia a conexão com o banco de dados MySQL usando PDO.
 *
 * Configuração por variáveis de ambiente:
 * DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASS.
 *
 * Para desenvolvimento local (por exemplo, XAMPP), os padrões são:
 * host=127.0.0.1, porta=3306, banco=tetrisphp, usuário=root e senha vazia.
 */
final class Database
{
    private static ?PDO $connection = null;

    /**
     * Retorna uma conexão PDO reutilizável durante a requisição atual.
     *
     * @throws RuntimeException Quando a configuração ou conexão falhar.
     */
    public static function getConnection(): PDO
    {
        if (self::$connection instanceof PDO) {
            return self::$connection;
        }

        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $portValue = getenv('DB_PORT') ?: '3306';
        $database = getenv('DB_NAME') ?: 'tetrisphp';
        $username = getenv('DB_USER') ?: 'root';

        $password = getenv('DB_PASS');
        if ($password === false) {
            $password = '';
        }

        $port = filter_var(
            $portValue,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1, 'max_range' => 65535]]
        );

        if ($port === false) {
            throw new RuntimeException('A variável DB_PORT deve conter uma porta válida.');
        }

        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $host,
            $port,
            $database
        );

        try {
            self::$connection = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $exception) {
            // A mensagem detalhada fica disponível como exceção anterior para logging.
            // Não a exibimos diretamente na resposta ao visitante.
            throw new RuntimeException(
                'Não foi possível conectar ao banco de dados. Verifique as configurações.',
                0,
                $exception
            );
        }

        return self::$connection;
    }
}
