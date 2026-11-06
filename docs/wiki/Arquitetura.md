# Arquitetura e estrutura de pastas

## Visão geral

A aplicação separa a execução do jogo, que acontece no navegador, do armazenamento de dados, que acontece no servidor.

- O JavaScript controla renderização, teclado, movimentação, colisões, gravidade e pontuação local da partida.
- O PHP entrega a interface, valida os dados recebidos pela API e coordena a persistência.
- O MySQL armazena as pontuações.
- O PDO faz a comunicação entre PHP e MySQL.

Essa separação evita enviar ao servidor uma requisição a cada movimento de peça.

## Layout de tela cheia

A interface ocupa a viewport inteira do navegador (100dvh/100vw), sem moldura externa ou barra de rolagem da página. No desktop, o tabuleiro fica centralizado e é dimensionado pela altura disponível; os painéis de próxima peça/estatísticas e comandos ficam nas laterais. Em telas pequenas, os indicadores são compactados acima do tabuleiro e os controles de toque ficam abaixo.

## Estrutura atual

```text
TetrisPHP/
├── index.php
├── public/
│   ├── index.php
│   └── assets/
│       ├── css/
│       │   └── style.css
│       ├── js/
│       │   ├── game.js
│       │   └── interface.js
│       └── audio/
├── src/
│   ├── Database.php
│   └── ScoreRepository.php
├── api/
│   ├── save-score.php
│   └── get-ranking.php
├── database/
│   └── schema.sql
└── docs/
    └── wiki/
```

Os arquivos `.gitkeep` mantêm diretórios ainda vazios versionados pelo Git.

## Responsabilidades

| Local | Responsabilidade |
|---|---|
| `index.php` | Ponto de entrada da aplicação na raiz |
| `public/index.php` | Marcação HTML e configuração de caminhos |
| `public/assets/css/` | Estilos da interface retrô |
| `public/assets/js/game.js` | Motor, tabuleiro, peças e regras locais |
| `public/assets/js/interface.js` | Teclado, botões, overlays e indicadores |
| `public/assets/audio/` | Espaço reservado para efeitos sonoros |
| `src/Database.php` | Criar e reutilizar a conexão PDO |
| `src/ScoreRepository.php` | Persistir pontuações e consultar rankings |
| `api/` | Endpoints para salvar e consultar pontuações |
| `database/schema.sql` | Criação do banco e das tabelas |
| `docs/wiki/` | Documentação técnica versionada |

## Fluxo de partida atual

1. O navegador carrega a interface e os scripts do jogo.
2. O jogador inicia a partida.
3. O motor cria o tabuleiro e sorteia peças usando uma bolsa embaralhada de sete tipos.
4. O JavaScript controla movimento, rotação, colisão, queda e limpeza de linhas.
5. A interface apresenta pontuação, linhas, nível e próxima peça.

Nesta etapa a pontuação é local, mantida no navegador durante a partida. A integração do fim de jogo com o endpoint de ranking ainda será feita.

## Fluxo previsto de gravação de pontuação

1. O jogo termina e o frontend solicita as iniciais do jogador.
2. O frontend envia iniciais, modalidade, pontuação e duração para um endpoint PHP.
3. O endpoint valida método HTTP e dados recebidos.
4. O endpoint obtém uma conexão via `Database::getConnection()`.
5. O endpoint instancia `ScoreRepository` e chama `saveScore()`.
6. O backend devolve uma resposta JSON ao navegador.

> Importante: a pontuação enviada pelo navegador é um dado controlado pelo cliente. A validação de formato não impede adulteração. Antes de publicar o jogo, devem ser avaliadas medidas adicionais contra trapaças.
