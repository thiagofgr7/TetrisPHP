# Backend: conexão PDO, repositório e API

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
3. Pontuação: número inteiro não negativo.
4. Duração em segundos: opcional e não negativa.

O método retorna o ID do registro criado. Dados inválidos geram `InvalidArgumentException`; falhas de banco geram exceções PDO/runtime.

### Consultar Top 10

```php
$topInfinite = $repository->getTop10();
$topTimeAttack = $repository->getTop10('time_attack');
```

Sem argumento, o método consulta o ranking do modo infinito. O resultado contém até dez registros, ordenados por pontuação decrescente e, em caso de empate, pela data e pelo ID em ordem crescente.

## Endpoints HTTP

### `POST /api/save-score.php`

Recebe JSON e registra uma pontuação. Exemplo de corpo:

```json
{
  "player_name": "ABC",
  "game_mode": "infinite",
  "score": 1200,
  "duration_seconds": 95
}
```

Campos:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `player_name` | string | Sim | De 1 a 3 letras A-Z; normalizado para maiúsculas |
| `game_mode` | string | Sim | `infinite` ou `time_attack` |
| `score` | integer | Sim | De 0 a 4294967295 |
| `duration_seconds` | integer ou null | Não | De 0 a 4294967295 |

Resposta de sucesso (HTTP 201):

```json
{
  "success": true,
  "message": "Pontuação registrada com sucesso.",
  "id": 1
}
```

Códigos de erro esperados:

- `400`: JSON inválido.
- `405`: método diferente de POST.
- `415`: Content-Type diferente de `application/json`.
- `422`: campo ausente, tipo inválido ou valor fora das regras.
- `500`: falha interna ou conexão com o banco indisponível.

### `GET /api/get-ranking.php?mode=infinite`

Consulta o Top 10. O parâmetro `mode` aceita `infinite` ou `time_attack` e é opcional; sem ele, o padrão é `infinite`.

Resposta de sucesso (HTTP 200):

```json
{
  "success": true,
  "game_mode": "infinite",
  "count": 1,
  "ranking": [
    {
      "position": 1,
      "id": 1,
      "player_name": "ABC",
      "game_mode": "infinite",
      "score": 1200,
      "duration_seconds": 95,
      "created_at": "2026-11-06 12:00:00"
    }
  ]
}
```

Os campos de data e hora serão os valores reais gravados pelo MySQL.

Códigos de erro esperados:

- `400`: modalidade inválida.
- `405`: método diferente de GET.
- `500`: falha interna ou conexão com o banco indisponível.

## Funções nativas exigidas no projeto

O backend utiliza funções da lista obrigatória:

| Função | Arquivo | Uso |
|---|---|---|
| `strtoupper()` | `src/ScoreRepository.php` | Normaliza as iniciais para maiúsculas |
| `strlen()` | `src/ScoreRepository.php` | Verifica o comprimento das iniciais |
| `max()` | `src/ScoreRepository.php` | Protege o repositório contra valores negativos |
| `count()` | `api/get-ranking.php` | Informa quantos resultados foram retornados |

## Integração do frontend com o ranking

Quando uma partida termina, `public/assets/js/interface.js`:

1. Solicita as iniciais (1 a 3 caracteres A-Z).
2. Normaliza o texto para maiúsculas e valida o formato no navegador.
3. Envia `player_name`, `score`, `duration_seconds` e a modalidade da partida em `game_mode`.
4. O modo Infinito usa `game_mode: "infinite"`; o Time Attack usa `game_mode: "time_attack"`.
5. Após a gravação, consulta `GET /api/get-ranking.php?mode=infinite` ou `GET /api/get-ranking.php?mode=time_attack`, de acordo com o modo jogado.
6. Exibe os dez primeiros registros do ranking correspondente.

Exemplo para Time Attack:

```json
{
  "player_name": "ABC",
  "game_mode": "time_attack",
  "score": 4200,
  "duration_seconds": 180
}
```

O mesmo endpoint de gravação e a mesma tabela são usados pelas duas modalidades; o campo `game_mode` separa os rankings. A lista é criada com elementos DOM e `textContent`, não com HTML concatenado. Se a gravação falhar, o formulário permanece disponível para nova tentativa.

## Segurança e limites conhecidos

- As operações SQL usam prepared statements.
- Os endpoints validam método HTTP, Content-Type e tipos/intervalos dos campos.
- As respostas são JSON e erros internos não são enviados ao navegador.
- O endpoint de gravação ainda recebe a pontuação informada pelo navegador. Um usuário pode alterar essa requisição manualmente. A validação de tipo e intervalo não comprova que a pontuação foi obtida em uma partida legítima.
- Antes de disponibilizar o jogo publicamente, implementar validação de partidas no servidor ou outro mecanismo antifraude, além de limitação de requisições.
- Ao inserir nomes na página HTML, renderizar com `textContent` no JavaScript ou usar `htmlspecialchars()` no PHP.
