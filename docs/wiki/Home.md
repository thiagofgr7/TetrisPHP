# TetrisPHP — Documentação do projeto

> Documentação técnica versionada em `docs/wiki/`, preparada como fonte para a Wiki do GitHub.

## Objetivo

Clone web de Tetris com visual retrô monocromático, frontend em HTML/CSS/JavaScript, backend PHP e ranking MySQL.

## Tecnologias

- **HTML5/CSS3:** interface CRT em tela cheia.
- **JavaScript:** motor do tabuleiro e controles.
- **PHP/PDO:** API, validação e persistência.
- **MySQL:** ranking por modalidade.

## Documentação

- [Arquitetura](Arquitetura.md)
- [Instalação e testes](Instalacao-e-Configuracao.md)
- [Banco de dados](Banco-de-Dados.md)
- [Backend e API](Backend-PDO-e-Ranking.md)
- [Motor e controles](Motor-do-Jogo.md)
- [Registro de alterações](Registro-de-Alteracoes.md)

## Estado atual

- Motor Tetris com sete peças, colisões, rotação, queda e limpeza de linhas.
- Hold para guardar/trocar uma peça, uma vez por peça ativa.
- T-Spin Mini e Full com pontuação própria.
- Modo Infinito com aumento de dificuldade a cada 30 segundos, limitado ao nível 10.
- Cronômetro que pausa junto com a partida.
- Tela de fim de jogo com cadastro de iniciais e gravação no ranking Top 10.
- Sete ações com controles reconfiguráveis e salvos no navegador.
- Interface CRT preto e branco, responsiva e em tela cheia.

## Pendente

- Modo Time Attack com três fases.
- Proteção antifraude mais forte para pontuações enviadas pelo navegador.
- Evoluir a implementação de rotações/T-Spin para compatibilidade completa com SRS.
