# Arquitetura e estrutura de pastas

## Visão geral

A aplicação separa a execução do jogo, que acontece no navegador, do armazenamento de dados, que acontece no servidor.

- O JavaScript controla renderização, teclado, movimentação, colisões, gravidade, Hold, rotações SRS, T-Spins e pontuação local.
- O PHP entrega a interface, valida os dados recebidos pela API e coordena a persistência.
- O MySQL armazena as pontuações.
- O PDO faz a comunicação entre PHP e MySQL.

Essa separação evita enviar ao servidor uma requisição a cada movimento de peça.

## Layout de tela cheia

A interface ocupa a viewport inteira do navegador, sem moldura externa ou barra de rolagem. No desktop, o tabuleiro fica centralizado e os painéis de Hold, próxima peça, estatísticas e comandos ficam nas laterais. Em telas pequenas, os previews e indicadores são compactados acima do tabuleiro, e os controles de toque ficam abaixo.

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
| `public/assets/js/game.js` | Motor, tabuleiro, peças, Hold, tabelas SRS, T-Spin e regras locais |
| `public/assets/js/interface.js` | Teclado, botões, overlays, remapeamento e indicadores |
| `public/assets/audio/` | Espaço reservado para efeitos sonoros |
| `src/Database.php` | Criar e reutilizar a conexão PDO |
| `src/ScoreRepository.php` | Persistir pontuações e consultar rankings |
| `api/` | Endpoints para salvar e consultar pontuações |
| `database/schema.sql` | Criação do banco e das tabelas |
| `docs/wiki/` | Documentação técnica versionada |

## Fluxo do modo Infinito

1. O jogador inicia o modo Infinito.
2. O motor cria o tabuleiro e sorteia peças usando uma bolsa embaralhada de sete tipos.
3. O jogador pode armazenar uma peça no Hold uma vez por peça ativa.
4. O JavaScript controla movimento, rotação, colisão, queda, T-Spin e limpeza de linhas.
5. A dificuldade aumenta a cada 30 segundos, até o nível 10 (130 ms por queda).
6. Cronômetro e progressão param durante a pausa.
7. Ao perder, o jogador informa iniciais; o frontend envia a pontuação para a API e consulta o Top 10.

## Sistema de rotação SRS

A implementação está concentrada em `public/assets/js/game.js` para manter o motor sem dependências adicionais. O helper `TetrisSRS` expõe as tabelas e a rotação de matrizes para simulações determinísticas.

- Estados por peça: `0`, `R`, `2`, `L`.
- Oito transições definidas por tabela, com cinco tentativas ordenadas por rotação.
- J/L/S/T/Z compartilham a tabela JLSTZ; I usa sua própria tabela; O preserva a matriz e não aplica kick.
- J/L/S/T/Z giram em uma caixa 3×3; I gira em 4×4. Os valores verticais das tabelas de referência (Y positivo para cima) são invertidos para o canvas (Y positivo para baixo).
- A rotação registra origem, destino, índice e deslocamento do kick. T-Spin depende de uma rotação aceita e do estado final; uma rotação que falha zera os metadados.
- Um movimento lateral ou uma descida manual efetiva substitui a rotação como último movimento. Uma tentativa de soft drop bloqueada fixa a peça sem apagar os metadados válidos; a gravidade automática e o hard drop também preservam a rotação até a fixação.

Os testes isolados de motor ficam em `tests/srs.test.js` e podem ser executados com `node --test tests/srs.test.js`. A suíte cobre as oito transições, as tabelas completas JLSTZ/I, kicks junto às duas paredes e ao piso, peça O, bloqueio total, Hold e T-Spin Mini/Full. Os testes simulam canvas e colisões, não a renderização do navegador nem a integração PHP/MySQL.

## Preferências de controles

O arquivo `public/assets/js/interface.js` permite reatribuir sete ações a teclas físicas distintas, incluindo Hold. As preferências ficam no `localStorage` do navegador; não são enviadas ao servidor. Teclas reservadas pelo navegador e duplicatas são recusadas.

## Fluxo de gravação de pontuação

1. O jogo termina e o frontend solicita as iniciais do jogador.
2. O frontend envia iniciais, modalidade `infinite`, pontuação e duração para um endpoint PHP.
3. O endpoint valida método HTTP e dados recebidos.
4. O endpoint obtém uma conexão via `Database::getConnection()`.
5. O endpoint instancia `ScoreRepository` e chama `saveScore()`.
6. O backend devolve uma resposta JSON ao navegador.

> Importante: a pontuação enviada pelo navegador é um dado controlado pelo cliente. A validação de formato não impede adulteração. Antes de publicar o jogo, devem ser avaliadas medidas adicionais contra trapaças.
