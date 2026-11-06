# Banco de dados

## Banco

O arquivo `database/schema.sql` cria o banco:

- Nome: `tetrisphp`
- Charset: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

A tabela usa InnoDB.

## Tabela `ranking`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `BIGINT UNSIGNED` | Chave primária autoincremental |
| `player_name` | `VARCHAR(3)` | Iniciais do jogador |
| `game_mode` | `ENUM('time_attack','infinite')` | Modalidade da partida |
| `score` | `INT UNSIGNED` | Pontuação |
| `duration_seconds` | `INT UNSIGNED`, nullable | Duração em segundos, quando informada |
| `created_at` | `TIMESTAMP` | Data e hora de registro |

O índice `idx_ranking_mode_score` auxilia a consulta do ranking por modalidade, pontuação e data.

A constraint `chk_ranking_player_name_length` restringe o tamanho do nome a 1–3 caracteres quando o mecanismo MySQL utilizado aplica constraints CHECK.

## Modalidades

- `infinite`: modo infinito, cuja dificuldade aumenta até um limite.
- `time_attack`: modo normal, composto por três fases.

As pontuações ficam separadas por modalidade, permitindo um Top 10 independente para cada modo.

## Consulta conceitual do Top 10

```sql
SELECT id, player_name, game_mode, score, duration_seconds, created_at
FROM ranking
WHERE game_mode = 'infinite'
ORDER BY score DESC, created_at ASC, id ASC
LIMIT 10;
```

Em caso de empate, o registro mais antigo aparece primeiro.

## Cuidados

O script é inicial e não cria usuário MySQL nem concede permissões. Para produção, crie um usuário específico para a aplicação e limite seus privilégios ao banco `tetrisphp`.
