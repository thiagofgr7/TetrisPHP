# Motor do jogo e interface

## Primeira versão jogável

O frontend inicial fica em:

- `index.php`: ponto de entrada simples na raiz do projeto.
- `public/index.php`: marcação HTML e configuração dos caminhos da aplicação.
- `public/assets/css/style.css`: identidade visual retrô monocromática.
- `public/assets/js/game.js`: motor e regras do tabuleiro.
- `public/assets/js/interface.js`: controles, botões e atualização dos indicadores.

## Tabuleiro e peças

- Tabuleiro com 10 colunas e 20 linhas.
- Sete peças clássicas: I, J, L, O, S, T e Z.
- Cada peça é representada por uma matriz 4×4.
- O gerador usa uma bolsa embaralhada de sete peças: cada conjunto contém uma ocorrência de cada tipo.
- A peça atual é impedida de atravessar as paredes, o chão ou blocos já fixados.
- A rotação é horária e tenta pequenos deslocamentos laterais para funcionar perto das paredes.
- Uma peça que não cabe na área inicial encerra a partida.

## Queda e pontuação

A gravidade é controlada por um intervalo em milissegundos que diminui conforme o nível aumenta. O nível sobe a cada dez linhas eliminadas e fica limitado a 10 nesta versão.

Pontuação atual:

| Ação | Pontos |
|---|---:|
| Descer uma linha manualmente | 1 |
| Queda rápida | 2 por linha percorrida |
| Eliminar 1 linha | 100 × nível |
| Eliminar 2 linhas | 300 × nível |
| Eliminar 3 linhas | 500 × nível |
| Eliminar 4 linhas | 800 × nível |

Esses valores são a configuração inicial do motor. Podem ser ajustados durante a implementação definitiva dos modos.

## Controles

| Tecla | Ação |
|---|---|
| Seta esquerda | Mover para esquerda |
| Seta direita | Mover para direita |
| Seta para baixo | Descer uma linha |
| Seta para cima | Girar |
| Espaço | Queda rápida |
| P ou Esc | Pausar/continuar |
| Enter | Iniciar ou continuar |

Em telas pequenas, a interface também mostra botões de toque para mover, descer, girar e fazer queda rápida.

## Aparência

A interface usa:

- Paleta somente preto, branco e tons de cinza.
- Canvas com grade e blocos de alto contraste.
- Prévia da próxima peça e painel de pontuação.
- Tipografia monoespaçada e bordas retangulares.
- Efeito de scanlines discreto, sem dependências externas.

## Escopo desta etapa

Esta primeira versão é um núcleo jogável de teste. Ainda não inclui:

- Menu para escolher Time Attack ou Infinito.
- As três fases do Time Attack.
- Cronômetro e regras específicas por fase.
- Progressão temporal do modo Infinito.
- Tela de iniciais e envio automático ao ranking.
- Proteção do servidor contra pontuações forjadas.

O ranking continua disponível por meio da API, mas a partida local ainda não envia o resultado ao backend.
