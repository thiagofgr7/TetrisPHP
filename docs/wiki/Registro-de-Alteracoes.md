# Registro de alterações

Este arquivo registra as mudanças técnicas feitas no repositório e as decisões associadas.

## Estado inicial

O repositório continha o README inicial com a descrição do projeto Tetris em PHP.

## Estrutura de diretórios

Foram adicionados:

- `public/assets/css/`
- `public/assets/js/`
- `public/assets/audio/`
- `src/`
- `api/`
- `database/`

Como diretórios vazios não são versionados pelo Git, foram incluídos arquivos `.gitkeep`.

## Banco de dados

Foi criado `database/schema.sql`, com:

- Banco `tetrisphp` em `utf8mb4`.
- Tabela `ranking`.
- Nome do jogador limitado a três caracteres.
- Modalidade de jogo separada entre `infinite` e `time_attack`.
- Pontuação, duração opcional e data do registro.
- Índice para consultas de ranking.

## Conexão

Foi criado `src/Database.php`, responsável por centralizar a conexão PDO e ler credenciais de variáveis de ambiente.

## Repositório de pontuações

Foi criado `src/ScoreRepository.php`, responsável por:

- Validar iniciais e modalidade.
- Normalizar as iniciais com `strtoupper()`.
- Limitar o comprimento usando `strlen()`.
- Evitar valores negativos com `max()`.
- Salvar pontuações com prepared statements.
- Retornar o Top 10 por modalidade.

## Processo de documentação

A partir desta etapa, cada mudança relevante deve atualizar esta documentação versionada em `docs/wiki/`. Ela está preparada como espelho/fonte para a Wiki do GitHub; ainda não foi publicada no espaço Wiki separado do repositório.
