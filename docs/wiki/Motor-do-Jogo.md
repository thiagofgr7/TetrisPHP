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
- Colisões impedem as peças de atravessar as paredes, o chão ou blocos já fixados.
- A rotação é horária e tenta pequenos deslocamentos laterais para funcionar perto das paredes.
- Uma peça que não cabe na área inicial encerra a partida.

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

## Pontuação

| Ação | Pontos |
|---|---:|
| Descer uma linha manualmente | 1 |
| Queda rápida | 2 por linha percorrida |
| Eliminar 1 linha | 100 × nível atual |
| Eliminar 2 linhas | 300 × nível atual |
| Eliminar 3 linhas | 500 × nível atual |
| Eliminar 4 linhas | 800 × nível atual |

A pontuação da limpeza de linhas usa o nível vigente no momento da eliminação.

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
- Pausar/continuar.

Regras:

- Uma tecla não pode ser atribuída a duas ações ao mesmo tempo.
- Teclas reservadas pelo navegador, como Tab, Enter, Esc e F5, não podem ser usadas.
- As configurações são armazenadas no `localStorage` do navegador com a chave `tetrisphp.controls.v1`.
- O botão **RESTAURAR PADRÕES** recupera as setas, Espaço e P.
- Os botões de toque continuam disponíveis em celulares, independentemente do mapeamento do teclado.

Padrões iniciais:

| Ação | Tecla |
|---|---|
| Esquerda | ← |
| Direita | → |
| Descer | ↓ |
| Girar | ↑ |
| Queda rápida | Espaço |
| Pausar | P |

## Aparência

- Paleta monocromática: preto profundo, branco fosco e cinzas.
- Scanlines e vinheta que simulam uma imagem CRT.
- Layout em tela inteira, sem rolagem.
- Tabuleiro central dimensionado pela altura disponível.
- Indicadores e próxima peça em painéis laterais; em telas pequenas, indicadores compactos acima do tabuleiro.
- Tipografia monoespaçada e blocos quadrados chapados.
- Botões retangulares de alto contraste.

## Escopo ainda pendente

- Modo Time Attack com três fases (fácil, média e difícil).
- Validação antifraude de pontuação no servidor. Atualmente, a pontuação calculada pelo navegador pode ser adulterada por requisições manuais.
- Teste visual final em navegadores e dispositivos reais.
