# TetrisPHP

[![JavaScript CI](https://github.com/thiagofgr7/TetrisPHP/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/thiagofgr7/TetrisPHP/actions/workflows/ci.yml)

Clone de Tetris em PHP, MySQL, HTML, CSS e JavaScript, com interface retrô responsiva, temas claro/escuro e visual CRT.

## Recursos implementados

- Motor Tetris com tabuleiro 10×20, sete peças e gerador de bolsa de sete.
- Modo Infinito: a velocidade aumenta a cada 30 segundos até o nível 10.
- Modo Time Attack: três fases de 60 segundos, cronômetro regressivo de 3 minutos e ranking separado.
- Multiplicadores por fase no Time Attack: ×1, ×2 e ×3 para limpeza de linhas e T-Spins.
- Hold para guardar e trocar uma peça, uma vez por peça ativa.
- Rotações Super Rotation System (SRS), com wall-kicks JLSTZ e tabela específica para I.
- T-Spin Mini e Full, com pontuação própria.
- Pausa que congela o cronômetro e a progressão da partida.
- Cadastro de iniciais e Top 10 independente por modalidade.
- Sete controles de teclado configuráveis, salvos no navegador, e controles de toque.
- Temas claro e escuro, com preferência persistida no navegador.
- Easter egg Konami Code que ativa/desativa peças coloridas e acentos de arcade.

## Modo Time Attack

Escolha **TIME ATTACK** no seletor da tela inicial. A partida dura três minutos e avança automaticamente entre três fases:

| Fase | Faixa do cronômetro | Intervalo de queda | Multiplicador |
|---|---|---:|---:|
| Fácil | 03:00 até 02:01 | 850 ms | ×1 |
| Média | 02:00 até 01:01 | 530 ms | ×2 |
| Difícil | 01:00 até 00:00 | 290 ms | ×3 |

Os multiplicadores são aplicados aos pontos de limpeza de linhas e T-Spins. A pontuação de descida manual e queda rápida mantém os valores fixos do motor. A pausa congela o cronômetro, a fase e a gravidade. Ao chegar a 00:00, o desafio é concluído; se as peças alcançarem o topo antes disso, a partida termina por game over.

O resultado é enviado com `game_mode: "time_attack"` e aparece no Top 10 dessa modalidade. O modo Infinito continua usando `game_mode: "infinite"` e seu próprio ranking. As duas modalidades usam a mesma tabela e API, sem precisar de uma tabela MySQL adicional.

## Regras de rotação SRS e T-Spin

- As orientações são **0**, **R**, **2** e **L**; cada uma das oito transições horárias/anti-horárias testa até cinco posições em ordem.
- J, L, S, T e Z compartilham a tabela JLSTZ; I usa a tabela específica de I; O mantém a geometria e não usa wall-kick.
- As tabelas completas estão documentadas em [Motor do Jogo](docs/wiki/Motor-do-Jogo.md). Os offsets verticais são convertidos para o eixo Y positivo para baixo do canvas.
- T-Spin exige uma rotação SRS válida ainda não substituída por movimento. Três cantos ocupados habilitam a classificação; os dois cantos frontais ou o quinto kick classificam Full, caso contrário Mini.
- Hold mantém a regra de um uso por peça e restaura a peça recebida na orientação inicial.

## Executar localmente

1. Inicie o MySQL e importe `database/schema.sql`.
2. Na raiz do projeto, execute:

   ```bash
   php -S 127.0.0.1:8000
   ```

3. Acesse [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

O schema já contém as modalidades `infinite` e `time_attack`. O servidor embutido do PHP é destinado somente a desenvolvimento local. Confira a [documentação de instalação e testes](docs/wiki/Instalacao-e-Configuracao.md).

## Testes automatizados

Com Node.js 18 ou superior, execute os testes determinísticos do motor:

```bash
node --check public/assets/js/game.js
node --check public/assets/js/interface.js
node --check tests/srs.test.js
node --check tests/browser.test.js
node --test tests/srs.test.js
```

Para os testes de interface, instale Playwright/Chromium e inicie o servidor PHP:

```bash
npm install --no-save --package-lock=false playwright
npx playwright install chromium
php -S 127.0.0.1:8000 -t .
```

Em outro terminal:

```bash
node --test tests/browser.test.js
```

A suíte determinística contém 16 testes, incluindo SRS, Hold, T-Spin e progressão/encerramento do Time Attack. A suíte de navegador contém cinco cenários: carregamento e pausa, controles, layout móvel, tema/Konami Code e seleção/cronômetro/pausa do Time Attack. Os testes não substituem a integração PHP/MySQL nem comprovam proteção contra pontuações adulteradas.

O GitHub Actions executa essas duas suítes em pushes para `main`, Pull Requests para `main` e execuções manuais. Consulte o [workflow JavaScript CI](.github/workflows/ci.yml).

## Limitações conhecidas

- A pontuação é calculada no navegador e pode ser adulterada por requisições manuais; não há validação antifraude no servidor.
- Os testes automatizados não cobrem a persistência real no MySQL nem todos os cenários visuais de rotação SRS.

## Documentação

Acesse [docs/wiki/](docs/wiki/Home.md) para arquitetura, instalação, banco de dados, API, regras do jogo e histórico.
