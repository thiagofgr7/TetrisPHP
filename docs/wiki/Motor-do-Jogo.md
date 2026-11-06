# Motor do jogo e interface

## Arquivos principais

- `index.php`: ponto de entrada na raiz do projeto.
- `public/index.php`: interface HTML e configuração dos caminhos de assets/API.
- `public/assets/css/style.css`: interface CRT responsiva, temas claro/escuro e paleta colorida do easter egg.
- `public/assets/js/game.js`: motor do tabuleiro e regras das partidas.
- `public/assets/js/interface.js`: seleção de modalidade, controles, telas, configuração de teclas e integração com o ranking.

## Tabuleiro e peças

- Tabuleiro com 10 colunas e 20 linhas.
- Sete peças clássicas: I, J, L, O, S, T e Z.
- Cada peça é representada por uma matriz 4×4.
- O gerador usa uma bolsa embaralhada de sete peças: cada conjunto contém uma ocorrência de cada tipo.
- Colisões impedem as peças de atravessar paredes, piso ou blocos já fixados.
- A rotação usa SRS: estados 0/R/2/L, oito transições com cinco testes ordenados e tabelas específicas para a peça I.
- Uma peça que não cabe na área inicial encerra a partida.

## Rotação — Super Rotation System (SRS)

O motor usa os quatro estados SRS **0**, **R**, **2** e **L**. O método `rotate(direction)` aceita rotação horária (padrão) e anti-horária (`direction = -1`). Cada transição escolhe sua tabela de cinco testes, começando pela posição sem deslocamento; a rotação só é confirmada quando a peça cabe no tabuleiro.

As peças J, L, S, T e Z compartilham as tabelas JLSTZ. A peça I usa uma tabela própria. Os pares abaixo estão expressos nas coordenadas do tabuleiro deste projeto: **X positivo move à direita e Y positivo move para baixo**. As tabelas de referência do SRS usam Y positivo para cima; por isso os valores verticais foram invertidos no código.

### Tabelas JLSTZ

| Transição | Teste 1 | Teste 2 | Teste 3 | Teste 4 | Teste 5 |
|---|---|---|---|---|---|
| 0 → R | (0, 0) | (-1, 0) | (-1, -1) | (0, +2) | (-1, +2) |
| R → 0 | (0, 0) | (+1, 0) | (+1, +1) | (0, -2) | (+1, -2) |
| R → 2 | (0, 0) | (+1, 0) | (+1, +1) | (0, -2) | (+1, -2) |
| 2 → R | (0, 0) | (-1, 0) | (-1, -1) | (0, +2) | (-1, +2) |
| 2 → L | (0, 0) | (+1, 0) | (+1, -1) | (0, +2) | (+1, +2) |
| L → 2 | (0, 0) | (-1, 0) | (-1, +1) | (0, -2) | (-1, -2) |
| L → 0 | (0, 0) | (-1, 0) | (-1, +1) | (0, -2) | (-1, -2) |
| 0 → L | (0, 0) | (+1, 0) | (+1, -1) | (0, +2) | (+1, +2) |

### Tabela da peça I

| Transição | Teste 1 | Teste 2 | Teste 3 | Teste 4 | Teste 5 |
|---|---|---|---|---|---|
| 0 → R | (0, 0) | (-2, 0) | (+1, 0) | (-2, +1) | (+1, -2) |
| R → 0 | (0, 0) | (+2, 0) | (-1, 0) | (+2, -1) | (-1, +2) |
| R → 2 | (0, 0) | (-1, 0) | (+2, 0) | (-1, -2) | (+2, +1) |
| 2 → R | (0, 0) | (+1, 0) | (-2, 0) | (+1, +2) | (-2, -1) |
| 2 → L | (0, 0) | (+2, 0) | (-1, 0) | (+2, -1) | (-1, +2) |
| L → 2 | (0, 0) | (-2, 0) | (+1, 0) | (-2, +1) | (+1, -2) |
| L → 0 | (0, 0) | (+1, 0) | (-2, 0) | (+1, +2) | (-2, -1) |
| 0 → L | (0, 0) | (-1, 0) | (+2, 0) | (-1, -2) | (+2, +1) |

- J/L/S/T/Z rotacionam dentro de uma caixa 3×3; I usa a caixa 4×4.
- O não executa wall-kick nem deslocamento visual: a matriz permanece igual e apenas o estado de orientação avança.
- Se os cinco testes falharem, a posição, a matriz e a orientação da peça permanecem inalteradas.
- A interface mantém o comando de rotação existente, que usa o sentido horário. O motor também oferece a direção anti-horária para chamadas e testes.


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

## Modo Time Attack

O Time Attack é uma partida com duração fixa de **3 minutos**, dividida em três fases consecutivas de **1 minuto**. O cronômetro é regressivo e a partida termina automaticamente quando chega a zero. Se as peças alcançarem o topo antes disso, a partida termina por game over.

| Fase | Tempo restante | Queda automática | Multiplicador da fase |
|---|---:|---:|---:|
| Fácil | 03:00 até 02:01 | 850 ms | ×1 |
| Média | 02:00 até 01:01 | 530 ms | ×2 |
| Difícil | 01:00 até 00:00 | 290 ms | ×3 |

- O indicador superior mostra o nome e o número da fase atual; o painel de estatísticas mostra o tempo restante.
- O multiplicador da fase é aplicado às limpezas de linhas e aos T-Spins, porque o nível interno acompanha a fase (1, 2 ou 3).
- Os pontos de descida manual (1 por linha) e queda rápida (2 por linha percorrida) mantêm seus valores fixos.
- Hold, SRS, T-Spin, descida manual e queda rápida permanecem disponíveis.
- A pausa congela cronômetro, progressão de fase e gravidade. Ao continuar, o tempo retoma de onde parou.
- Ao terminar o tempo, o jogador pode registrar a pontuação e consultar o Top 10 exclusivo de `time_attack`.
- O modo Infinito mantém cronômetro crescente, progressão de nível própria e ranking `infinite`.

## T-Spin

Um T-Spin é detectado quando uma peça T é fixada após uma rotação SRS bem-sucedida e pelo menos três dos quatro cantos diagonais ao redor do pivô fixo (1,1) da caixa 3×3 estão ocupados por blocos, paredes ou piso.

Classificação implementada:

- **T-Spin Full:** os dois cantos frontais da orientação final estão ocupados ou a rotação usou o quinto teste da tabela de kicks.
- **T-Spin Mini:** três cantos estão ocupados, mas a condição de Full não foi atingida.
- A detecção exige metadados de uma rotação válida (estado de origem/destino, índice e deslocamento do kick). Uma tentativa que falha limpa esses metadados e não pode gerar spin.
- Movimentos laterais e descidas manuais que realmente deslocam a peça cancelam o estado de rotação. Se a descida manual já estiver bloqueada, a peça é fixada preservando a rotação válida; gravidade automática e queda rápida também preservam o estado até a fixação.

Pontuação por T-Spin, multiplicada pelo nível atual:

| Tipo | Sem linha | 1 linha | 2 linhas | 3 linhas |
|---|---:|---:|---:|---:|
| T-Spin Mini | 100 | 200 | 400 | — |
| T-Spin Full | 400 | 800 | 1.200 | 1.600 |

O último evento aparece no indicador **ÚLTIMA JOGADA**. A rotação e os wall-kicks seguem as tabelas SRS descritas acima. A classificação T-Spin aplica os critérios de cantos, frente e quinto teste de kick definidos nesta seção; regras específicas de variantes não fazem parte do escopo.

## Pontuação normal

| Ação | Pontos |
|---|---:|
| Descer uma linha manualmente | 1 |
| Queda rápida | 2 por linha percorrida |
| Eliminar 1 linha | 100 × nível atual |
| Eliminar 2 linhas | 300 × nível atual |
| Eliminar 3 linhas | 500 × nível atual |
| Eliminar 4 linhas | 800 × nível atual |

A pontuação da limpeza de linhas usa o nível vigente no momento da eliminação. No Time Attack, esse nível corresponde à fase (1, 2 ou 3), portanto as limpezas e os T-Spins recebem multiplicadores ×1, ×2 e ×3. Quando a jogada é um T-Spin, aplica-se a tabela específica de T-Spin em vez da pontuação normal de linhas.

## Fim de partida e ranking

Quando o tempo do Time Attack chega a zero ou as peças alcançam o topo em qualquer modalidade, o overlay solicita as iniciais do jogador (de 1 a 3 letras A-Z). Após a confirmação:

1. O frontend envia as iniciais, modalidade, pontuação e duração para `POST /api/save-score.php`.
2. A modalidade é `infinite` para o modo Infinito ou `time_attack` para o Time Attack.
3. Após a gravação, o frontend consulta `GET /api/get-ranking.php?mode=infinite` ou `GET /api/get-ranking.php?mode=time_attack`, conforme a partida.
4. A tela exibe o Top 10 separado da modalidade correspondente.

A tabela `ranking`, o `ScoreRepository` e os endpoints já aceitam as duas modalidades; não há uma tabela separada por modo nem uma migração adicional no schema atual. O navegador valida o formulário para facilitar a interação; o backend valida novamente as iniciais, modalidade e campos recebidos.

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


## Testes automatizados do motor

Com Node.js 18 ou superior, execute na raiz do repositório:

```bash
node --test tests/srs.test.js
```

A suíte usa um canvas simulado e cobre as oito transições de orientação, os cinco offsets de todas as transições JLSTZ/I, geometria 3×3/4×4, wall-kicks reais nas duas paredes, kick junto ao piso, peça I, peça O sem deslocamento, falha dos cinco testes, Hold (armazenar, bloquear, liberar e trocar), T-Spin Mini/Full, promoção pelo quinto kick e preservação do T-Spin quando o soft drop já está bloqueado. Ela não substitui testes visuais em navegador nem testes de integração com PHP/MySQL.


## Aparência

- Paleta monocromática padrão: preto profundo, branco fosco e cinzas; tema claro opcional.
- Easter egg Konami Code para ativar a paleta colorida das sete peças e acentos de interface.
- Scanlines e vinheta que simulam uma imagem CRT.
- Layout em tela inteira, sem rolagem.
- Tabuleiro central dimensionado pela altura disponível.
- Painéis de peça guardada, próxima peça e estatísticas.
- Tipografia monoespaçada e blocos quadrados chapados.
- Botões retangulares de alto contraste.

## Escopo ainda pendente

- Validação antifraude de pontuação no servidor. Atualmente, o score calculado no navegador pode ser adulterado por requisições manuais.
- Testes de integração da persistência PHP/MySQL e revisão visual manual de cenários de rotação SRS/T-Spin.
