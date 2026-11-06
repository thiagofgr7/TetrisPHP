# Motor do jogo e interface

## Arquivos principais

- `index.php`: ponto de entrada na raiz do projeto.
- `public/index.php`: interface HTML e configuração dos caminhos de assets/API.
- `public/assets/css/style.css`: interface CRT monocromática em tela cheia.
- `public/assets/js/game.js`: motor do tabuleiro e regras da partida.
- `public/assets/js/interface.js`: controles, telas, configuração de teclas e integração com o ranking.

## Tabuleiro e peças

- Tabuleiro com 10 colunas e 20 linhas.
- Sete peças clássicas: I, J, L, O, S, T e Z.
- Cada peça é representada por uma matriz 4×4.
- O gerador usa uma bolsa embaralhada de sete peças: cada conjunto contém uma ocorrência de cada tipo.
- Colisões impedem as peças de atravessar paredes, piso ou blocos já fixados.
- A rotação é horária e tenta pequenos deslocamentos laterais para funcionar perto das paredes.
- Uma peça que não cabe na área inicial encerra a partida.

## Hold — guardar peça

O Hold permite armazenar uma peça para usá-la mais tarde.

- Atalho padrão: **C**.
- O primeiro uso guarda a peça atual e coloca no tabuleiro a próxima peça da fila.
- Se já houver uma peça guardada, o Hold troca a peça atual pela armazenada.
- Cada peça ativa pode ser guardada apenas uma vez. A opção é liberada novamente quando a peça atual é fixada e a próxima aparece.
- A peça guardada é exibida no painel **PEÇA GUARDADA**.
- O Hold também está disponível no botão de toque **HOLD** e pode ser remapeado pelo menu **TECLAS**.
- Ao trocar, a peça recuperada retorna à orientação e posição inicial.

## Modo Infinito

O modo Infinito é iniciado pela tela principal. A dificuldade aumenta de acordo com o tempo efetivamente jogado; linhas eliminadas não alteram o nível.

| Nível | Intervalo de queda |
|---:|---:|
| 1 | 850 ms |
| 2 | 770 ms |
| 3 | 690 ms |
| 4 | 610 ms |
| 5 | 530 ms |
| 6 | 450 ms |
| 7 | 370 ms |
| 8 | 290 ms |
| 9 | 210 ms |
| 10 | 130 ms |

- O nível sobe a cada 30 segundos.
- O nível máximo é 10.
- A velocidade fica travada em 130 ms a partir de 4 minutos e 30 segundos.
- O cronômetro e a progressão de dificuldade param durante a pausa.
- O contador de tempo mostra minutos e segundos.

## T-Spin

Um T-Spin é detectado quando uma peça T é fixada após uma rotação válida e pelo menos três dos quatro cantos diagonais ao redor do pivô estão ocupados por blocos, paredes ou piso.

Classificação implementada:

- **T-Spin Full:** os dois cantos frontais estão ocupados ou a rotação precisou de um deslocamento lateral de duas colunas.
- **T-Spin Mini:** três cantos estão ocupados, mas a condição de Full não foi atingida.
- A classificação usa a orientação da peça e considera a última ação relevante. Movimentos laterais ou descida manual depois da rotação cancelam o estado de rotação; a gravidade automática e a queda rápida preservam a rotação até a fixação.

Pontuação por T-Spin, multiplicada pelo nível atual:

| Tipo | Sem linha | 1 linha | 2 linhas | 3 linhas |
|---|---:|---:|---:|---:|
| T-Spin Mini | 100 | 200 | 400 | — |
| T-Spin Full | 400 | 800 | 1.200 | 1.600 |

O último evento aparece no indicador **ÚLTIMA JOGADA**. A detecção foi adaptada ao sistema atual de rotação 4×4 e aos deslocamentos laterais simples do projeto; ainda não é uma implementação completa do sistema SRS de jogos competitivos.

## Pontuação normal

| Ação | Pontos |
|---|---:|
| Descer uma linha manualmente | 1 |
| Queda rápida | 2 por linha percorrida |
| Eliminar 1 linha | 100 × nível atual |
| Eliminar 2 linhas | 300 × nível atual |
| Eliminar 3 linhas | 500 × nível atual |
| Eliminar 4 linhas | 800 × nível atual |

A pontuação da limpeza de linhas usa o nível vigente no momento da eliminação. Quando a jogada é um T-Spin, aplica-se a tabela específica de T-Spin em vez da pontuação normal de linhas.

## Fim de partida e ranking

1. Quando as peças não conseguem mais entrar no tabuleiro, o jogo encerra.
2. A tela solicita as iniciais do jogador (de 1 a 3 letras A-Z).
3. O frontend envia nome, modalidade `infinite`, pontuação e duração para `POST /api/save-score.php`.
4. Após a gravação, o frontend consulta `GET /api/get-ranking.php?mode=infinite`.
5. A tela exibe o Top 10 do modo Infinito e oferece a opção de iniciar outra partida.

O navegador valida o formulário para facilitar a interação; o backend valida novamente as iniciais e os campos recebidos.

## Controles configuráveis

O botão **TECLAS** abre a configuração de controles. O jogador seleciona uma ação e pressiona a tecla desejada.

Ações configuráveis:

- Mover para esquerda.
- Mover para direita.
- Descer.
- Girar.
- Queda rápida.
- Guardar peça (Hold).
- Pausar/continuar.

Regras:

- Uma tecla não pode ser atribuída a duas ações ao mesmo tempo.
- Teclas reservadas pelo navegador, como Tab, Enter, Esc e F5, não podem ser usadas.
- As configurações são armazenadas no `localStorage` do navegador com a chave `tetrisphp.controls.v1`.
- O botão **RESTAURAR PADRÕES** recupera as setas, Espaço, C e P.
- Os botões de toque continuam disponíveis em celulares, independentemente do mapeamento do teclado.

Padrões iniciais:

| Ação | Tecla |
|---|---|
| Esquerda | ← |
| Direita | → |
| Descer | ↓ |
| Girar | ↑ |
| Queda rápida | Espaço |
| Guardar peça | C |
| Pausar | P |

## Aparência

- Paleta monocromática: preto profundo, branco fosco e cinzas.
- Scanlines e vinheta que simulam uma imagem CRT.
- Layout em tela inteira, sem rolagem.
- Tabuleiro central dimensionado pela altura disponível.
- Painéis de peça guardada, próxima peça e estatísticas.
- Tipografia monoespaçada e blocos quadrados chapados.
- Botões retangulares de alto contraste.

## Escopo ainda pendente

- Modo Time Attack com três fases (fácil, média e difícil).
- Validação antifraude de pontuação no servidor. Atualmente, a pontuação calculada pelo navegador pode ser adulterada por requisições manuais.
- Revisar a detecção de T-Spin com testes em navegador e, futuramente, ampliar a compatibilidade com SRS.
