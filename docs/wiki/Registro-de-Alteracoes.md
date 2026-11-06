# Registro de alterações

## Fundação do projeto

- Criada a estrutura de diretórios para frontend, backend e banco.
- Criado `database/schema.sql` com banco `tetrisphp` e tabela `ranking`.
- Criada `src/Database.php` para conexão PDO.
- Criada `src/ScoreRepository.php` para salvar pontuações e consultar o Top 10.
- Criados `api/save-score.php` e `api/get-ranking.php`.

## Interface e motor base

- Criados `index.php` e `public/index.php`.
- Criados `public/assets/css/style.css`, `public/assets/js/game.js` e `public/assets/js/interface.js`.
- Implementado tabuleiro 10×20, sete peças, movimentação, rotação, colisão, quedas, limpeza de linhas, pontuação, pausa e reinício.
- Aplicado visual CRT monocromático em tela cheia, sem borda de página nem rolagem.

## Modo Infinito

- Dificuldade aumenta por tempo: um nível a cada 30 segundos.
- Velocidade limitada ao nível 10 (130 ms), alcançado após 4 minutos e 30 segundos.
- Cronômetro e progressão param durante a pausa.
- Ao perder, a tela solicita iniciais de 1 a 3 letras.
- A pontuação é enviada a `POST /api/save-score.php`; o Top 10 é carregado por `GET /api/get-ranking.php?mode=infinite`.

## Controles configuráveis

- Adicionada configuração para esquerda, direita, descer, girar, queda rápida, Hold e pausa.
- Captura de tecla por ação, prevenção de duplicatas e bloqueio de teclas reservadas.
- Preferências salvas no `localStorage` com a chave `tetrisphp.controls.v1`.
- Incluído comando para restaurar os controles padrão.

## Hold

- Adicionado painel de peça guardada, com prévia própria.
- O jogador pode guardar ou trocar a peça ativa uma vez por peça fixada.
- A tecla padrão é C; existe também botão Hold em dispositivos de toque.
- A peça recuperada reaparece na orientação e posição iniciais.

## T-Spin

- Adicionada detecção para peças T fixadas após rotação válida com três cantos ocupados.
- Classificação Mini/Full por cantos frontais e uso do quinto teste de kick SRS.
- Pontuação própria para T-Spin sem linha, Single, Double e Triple (Full), multiplicada pelo nível.
- Adicionado indicador da última jogada na área de estatísticas.

## Sistema Super Rotation System (SRS)

- Substituídos os deslocamentos horizontais simplificados pelas oito transições oficiais de wall-kick.
- Aplicadas as tabelas JLSTZ compartilhadas e a tabela específica da peça I; coordenadas verticais convertidas para o eixo Y descendente do canvas.
- Separadas as caixas de rotação 3×3 (J/L/S/T/Z) e 4×4 (I); O mantém sua geometria e não aplica kicks.
- Adicionada rotação horária/anti-horária no motor, mantendo o comando configurável atual no sentido horário.
- Metadados de origem/destino, orientação e kick aceito passaram a controlar a detecção de T-Spin; tentativa inválida limpa os metadados.
- T-Spin Full considera os dois cantos frontais ou o quinto teste de kick.
- Descida manual efetiva cancela a rotação anterior; uma tentativa de soft drop bloqueada fixa a peça sem descartar um T-Spin válido.
- Adicionada a suíte determinística `tests/srs.test.js` com 13 cenários, incluindo todas as tabelas JLSTZ/I, kicks reais nas duas paredes e no piso, Hold completo e soft drop bloqueado; comando: `node --test tests/srs.test.js`.

## Verificações técnicas

- `game.js` compilado para verificação sintática no V8.
- Os 13 cenários de `tests/srs.test.js` passaram em execução determinística com adaptador de módulos Node (13/13). O comando nativo `node --test` não foi executado nesta verificação.
- As simulações cobrem Hold (armazenar, bloquear segundo uso, liberar após peça nova e trocar), T-Spin Mini/Full, rejeição com menos de três cantos, quinto kick e soft drop bloqueado.
- Testes visuais em navegador e integração/persistência PHP/MySQL não foram executados e devem ser conferidos no ambiente local.

## Próximas etapas

- Implementar o Time Attack com três fases (fácil, média e difícil).
- Reforçar a validação antifraude do score no servidor antes de publicar.
- Validar visualmente rotação e T-Spin em navegadores reais.


## Integração contínua JavaScript

- Adicionado `.github/workflows/ci.yml` para executar em pushes para `main`, Pull Requests direcionados a `main` e acionamento manual.
- O job configura Node.js 20, executa `node --check` em `game.js`, `interface.js` e `tests/srs.test.js`, e roda a suíte nativa com `node --test tests/srs.test.js`.
- Atualizada a documentação de instalação para explicar execução local e escopo do CI; removida a observação antiga que descrevia a detecção T-Spin como baseada em kicks simplificados.
- O workflow foi publicado; o resultado da primeira execução deve ser conferido em GitHub Actions. O CI não executa testes de navegador nem integração PHP/MySQL.
