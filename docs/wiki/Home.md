# TetrisPHP — Documentação do projeto

> Esta documentação é mantida em `docs/wiki/` como fonte versionada para a Wiki do GitHub.
> A Wiki do repositório está habilitada, mas a integração usada para editar o código não disponibiliza publicação direta de páginas nela.

## Objetivo

Construir um clone web de Tetris com visual retrô preto e branco, frontend em HTML, CSS e JavaScript, backend em PHP e persistência em MySQL.

## Tecnologias

- **HTML5 e CSS3:** estrutura e apresentação da interface.
- **JavaScript:** motor em tempo real do tabuleiro e interação no navegador.
- **PHP:** páginas públicas, endpoints, validação e acesso a dados.
- **MySQL:** armazenamento do ranking.
- **PDO:** acesso ao MySQL com consultas preparadas.

## Páginas

- [Arquitetura e estrutura de pastas](Arquitetura.md)
- [Instalação e configuração local e testes](Instalacao-e-Configuracao.md)
- [Banco de dados](Banco-de-Dados.md)
- [Backend, endpoints e funções PHP](Backend-PDO-e-Ranking.md)
- [Motor do jogo e controles](Motor-do-Jogo.md)
- [Registro de alterações](Registro-de-Alteracoes.md)

## Estado atual

Já foram adicionados:

- Estrutura inicial de diretórios.
- Banco e tabela `ranking`.
- Conexão PDO e repositório de pontuações.
- Endpoints para salvar e consultar o Top 10.
- Interface de jogo em tela cheia, sem moldura externa/rolagem, com aparência retrô CRT monocromática e layout responsivo.
- Motor em JavaScript com sete peças, rotação, movimentação, colisões, queda, limpeza de linhas, pontuação, níveis, pausa e reinício.
- Controles de teclado e botões para telas de toque.

Ainda estão pendentes os dois modos definitivos, as fases do Time Attack, a progressão temporal do Infinito e o envio da pontuação final ao ranking.
