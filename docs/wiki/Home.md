# TetrisPHP — Documentação do projeto

Clone web de Tetris com visual retrô, frontend em HTML/CSS/JavaScript, backend PHP e ranking MySQL.

## Tecnologias

- **HTML5/CSS3:** interface CRT responsiva, com temas claro e escuro.
- **JavaScript:** motor do tabuleiro, SRS, Hold, T-Spin, Time Attack e controles.
- **PHP/PDO:** API, validação dos dados recebidos e persistência.
- **MySQL:** ranking Top 10 separado por modalidade.

## Documentação

- [Arquitetura](Arquitetura.md)
- [Instalação e testes](Instalacao-e-Configuracao.md)
- [Banco de dados](Banco-de-Dados.md)
- [Backend e API](Backend-PDO-e-Ranking.md)
- [Motor e controles](Motor-do-Jogo.md)
- [Registro de alterações](Registro-de-Alteracoes.md)

## Estado atual

- Motor Tetris com tabuleiro 10×20, sete peças, colisões, quedas e limpeza de linhas.
- Modo Infinito com dificuldade crescente a cada 30 segundos, limitado ao nível 10.
- Time Attack com cronômetro regressivo de 3 minutos e fases Fácil, Média e Difícil de 60 segundos.
- Multiplicadores ×1, ×2 e ×3 para pontuação de limpeza de linhas e T-Spins no Time Attack.
- Hold, SRS completo e T-Spin Mini/Full.
- Tela de fim de partida com cadastro de iniciais e ranking Top 10 por modalidade.
- Sete ações com controles reconfiguráveis e salvos no navegador, além de controles de toque.
- Tema claro/escuro persistente e easter egg Konami Code para ativar a paleta colorida.
- CI com suíte determinística do motor e testes de interface em Chromium.

## Pendente

- Validação antifraude da pontuação no servidor; atualmente o score é calculado no navegador.
- Testes de integração da gravação/consulta do ranking com PHP e MySQL reais.
- Revisão visual manual de todos os cenários de rotação SRS e T-Spin.
