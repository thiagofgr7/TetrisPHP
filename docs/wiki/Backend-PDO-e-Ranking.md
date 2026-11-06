# Backend: conexão PDO e ranking

## `Database.php`

Arquivo: `src/Database.php`

A classe `Database` disponibiliza o método estático:

```php
$pdo = Database::getConnection();
```

Características:

- Conecta ao MySQL usando PDO e charset `utf8mb4`.
- Lê host, porta, banco, usuário e senha de variáveis de ambiente.
- Mantém uma instância reutilizável durante a requisição atual.
- Configura `PDO::ERRMODE_EXCEPTION`.
- Define resultados associativos como padrão.
- Desativa prepared statements emulados.
- Substitui o erro de conexão por uma mensagem genérica, mantendo a exceção original como causa.

## `ScoreRepository.php`

Arquivo: `src/ScoreRepository.php`

O construtor recebe uma conexão PDO:

```php
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/ScoreRepository.php';

$repository = new ScoreRepository(Database::getConnection());
```

### Salvar pontuação

```php
$id = $repository->saveScore(
    'ABC',
    'infinite',
    1200,
    95
);
```

Parâmetros:

1. Nome do jogador: de 1 a 3 letras ASCII, entre A e Z.
2. Modalidade: `infinite` ou `time_attack`.
3. Pontuação: número inteiro; valores negativos são ajustados para zero.
4. Duração em segundos: opcional; valores negativos são ajustados para zero.

O método retorna o ID do registro criado. Dados inválidos geram `InvalidArgumentException`; falhas de banco podem gerar `PDOException`.

### Consultar Top 10

```php
$topInfinite = $repository->getTop10(); 
$topTimeAttack = $repository->getTop10('time_attack');
```

Sem argumento, o método consulta o ranking do modo infinito. O método aceita também `time_attack`. O resultado contém até dez registros, ordenados por pontuação decrescente e, em caso de empate, pela data e pelo ID em ordem crescente.

## Funções nativas exigidas no projeto

O backend já utiliza funções da lista obrigatória:

| Função | Arquivo | Uso |
|---|---|---|
| `strtoupper()` | `src/ScoreRepository.php` | Normaliza as iniciais para maiúsculas |
| `strlen()` | `src/ScoreRepository.php` | Verifica o comprimento das iniciais |
| `max()` | `src/ScoreRepository.php` | Impede que pontuação e duração sejam negativas |

Essas funções são executadas no processamento de dados do backend, não apenas em exemplos ou comentários.

## Limites e próximos passos

- O repositório não substitui a validação do endpoint HTTP.
- Ainda é necessário criar os endpoints de salvar e consultar ranking.
- A API deve validar método HTTP, tipo e intervalo dos campos, e retornar JSON com códigos HTTP apropriados.
- Ao mostrar nomes na interface, usar escape HTML, por exemplo `htmlspecialchars()` no PHP, quando os dados forem inseridos em HTML.
- Pontuações recebidas diretamente do navegador podem ser adulteradas; o backend ainda não consegue comprovar que uma partida foi legítima.
