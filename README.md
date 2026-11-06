# TetrisPHP

[![JavaScript CI](https://github.com/thiagofgr7/TetrisPHP/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/thiagofgr7/TetrisPHP/actions/workflows/ci.yml)

Clone de Tetris em PHP, MySQL, HTML, CSS e JavaScript, com interface retrô monocromática em tela cheia.

## Recursos implementados

- Motor do Tetris com tabuleiro 10×20 e sete peças.
- Modo Infinito com dificuldade crescente e limitada ao nível 10.
- Hold para guardar e trocar uma peça.
- Rotações Super Rotation System (SRS), com wall-kicks JLSTZ e tabela específica para I.
- T-Spin Mini e Full com pontuação própria e metadados da rotação SRS.
- Cronômetro com suporte a pausa.
- Cadastro das iniciais ao fim da partida e integração com o ranking Top 10.
- Sete controles de teclado configuráveis e salvos no navegador.
- Controles de toque para telas pequenas.

## Regras de rotação SRS e T-Spin

- As orientações são **0**, **R**, **2** e **L**; cada uma das oito transições horárias/anti-horárias testa até cinco posições em ordem.
- J, L, S, T e Z compartilham a tabela JLSTZ; I usa a tabela específica de I; O gira no próprio eixo sem wall-kick ou deslocamento.
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

O servidor embutido do PHP é destinado somente a desenvolvimento local. Confira a [documentação de instalação e testes](docs/wiki/Instalacao-e-Configuracao.md).

## Testes automatizados

Com Node.js 18 ou superior, execute a suíte determinística do motor (o CI usa Node.js 20):

```bash
node --test tests/srs.test.js
```

A suíte determinística cobre as oito transições e tabelas oficiais JLSTZ/I, kicks nas duas paredes e junto ao piso, peças I/O, bloqueio dos cinco testes, Hold e T-Spin Mini/Full. Ela não realiza teste de navegador nem integração PHP/MySQL.

## Limitações e próximas etapas

- O modo Time Attack com três fases (fácil, média e difícil) ainda não foi implementado.
- A pontuação é calculada no navegador e pode ser adulterada por requisições manuais; a validação antifraude no servidor permanece pendente.
- A suíte de motor não substitui testes visuais em navegador nem testes de integração PHP/MySQL.

## Documentação

Acesse [docs/wiki/](docs/wiki/Home.md) para arquitetura, banco, backend, regras do jogo e histórico.


O GitHub Actions verifica a sintaxe de `game.js`, `interface.js` e `tests/srs.test.js`, além de executar os testes nativos com `node --test` em pushes para `main`, Pull Requests e execuções manuais. Consulte o [workflow JavaScript CI](.github/workflows/ci.yml).
