# Arquitetura e estrutura de pastas

## Visão geral

A aplicação separa a execução do jogo, que acontece no navegador, do armazenamento de dados, que acontece no servidor.

- O JavaScript controla renderização, teclado, movimentação das peças, colisões, relógio e pontuação durante a partida.
- O PHP oferece endpoints HTTP, valida os dados recebidos e coordena a persistência.
- O MySQL armazena as pontuações.
- O PDO faz a comunicação entre PHP e MySQL.

Essa separação evita enviar ao servidor uma requisição a cada movimento de peça.

## Estrutura atual

```text
TetrisPHP/
├── public/
│   └── assets/
│       ├── css/
│       ├── js/
│       └── audio/
├── src/
│   ├── Database.php
│   └── ScoreRepository.php
├── api/
├── database/
│   └── schema.sql
└── docs/
    └── wiki/
```

Os arquivos `.gitkeep` mantêm diretórios ainda vazios versionados pelo Git.

## Responsabilidades previstas

| Local | Responsabilidade |
|---|---|
| `public/` | Arquivos acessíveis pelo navegador e ponto de entrada web |
| `public/assets/css/` | Estilos da interface retrô |
| `public/assets/js/` | Motor do Tetris e controles da interface |
| `public/assets/audio/` | Efeitos sonoros |
| `src/Database.php` | Criar e reutilizar a conexão PDO |
| `src/ScoreRepository.php` | Persistir pontuações e consultar rankings |
| `api/` | Endpoints para salvar e consultar pontuações |
| `database/schema.sql` | Criação do banco e das tabelas |
| `docs/wiki/` | Documentação técnica versionada |

## Fluxo previsto de gravação de pontuação

1. O jogo termina e o frontend solicita as iniciais do jogador.
2. O frontend envia iniciais, modalidade, pontuação e duração para um endpoint PHP.
3. O endpoint valida o método HTTP e os dados recebidos.
4. O endpoint obtém uma conexão via `Database::getConnection()`.
5. O endpoint instancia `ScoreRepository` e chama `saveScore()`.
6. O backend devolve uma resposta JSON ao navegador.

> Importante: a pontuação enviada pelo navegador ainda é um dado controlado pelo cliente. A validação de formato não impede adulteração de pontuação. Antes de publicar o jogo, devem ser avaliadas medidas adicionais contra trapaças.
