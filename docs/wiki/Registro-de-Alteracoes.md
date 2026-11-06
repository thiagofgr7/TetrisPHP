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

## Correção de caminhos

A página calcula os caminhos públicos dos assets e da API a partir de `DOCUMENT_ROOT`, com fallback para instalações em subpastas do XAMPP.

## Modo Infinito

- Dificuldade passa a aumentar por tempo: um nível a cada 30 segundos.
- Velocidade fica limitada ao nível 10 (130 ms), alcançado após 4 minutos e 30 segundos.
- Cronômetro e progressão param durante a pausa.
- Ao perder, a tela solicita iniciais de 1 a 3 letras.
- A pontuação é enviada a `POST /api/save-score.php`; o Top 10 é carregado por `GET /api/get-ranking.php?mode=infinite`.
- A tela de resultado permite iniciar outra partida após a gravação.

## Controles configuráveis

- Adicionada configuração para esquerda, direita, descer, girar, queda rápida e pausa.
- Captura de tecla por ação, prevenção de duplicatas e bloqueio de teclas reservadas.
- Preferências salvas no `localStorage` com a chave `tetrisphp.controls.v1`.
- Incluído comando para restaurar os controles padrão.

## Verificações técnicas

- Os arquivos JavaScript passaram por verificação de sintaxe.
- Simulação do motor confirmou subida de nível após 30 segundos, limite no nível 10, velocidade mínima de 130 ms e pausa do cronômetro.
- O teste visual final de interface e a persistência contra o MySQL devem ser conferidos no ambiente local.

## Próximas etapas

- Implementar o Time Attack com três fases (fácil, média e difícil).
- Reforçar a validação antifraude do score no servidor antes de publicar.
