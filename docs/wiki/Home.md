# TetrisPHP — Documentação do projeto

> Esta documentação é mantida em `docs/wiki/` como fonte versionada para a Wiki do GitHub.
> A Wiki do repositório está habilitada, mas a integração usada para editar o código não disponibiliza publicação direta de páginas nela.

## Objetivo

Construir um clone web de Tetris com visual retrô preto e branco, frontend em HTML, CSS e JavaScript, backend em PHP e persistência em MySQL.

## Tecnologias

- **HTML5 e CSS3:** estrutura e apresentação da interface.
- **JavaScript:** lógica em tempo real do tabuleiro e interação no navegador.
- **PHP:** regras de backend, validação e acesso a dados.
- **MySQL:** armazenamento do ranking.
- **PDO:** acesso ao MySQL com consultas preparadas.

## Páginas

- [Arquitetura e estrutura de pastas](Arquitetura.md)
- [Instalação e configuração local](Instalacao-e-Configuracao.md)
- [Banco de dados](Banco-de-Dados.md)
- [Backend: conexão PDO e ranking](Backend-PDO-e-Ranking.md)
- [Registro de alterações](Registro-de-Alteracoes.md)

## Estado atual

Já foram adicionados:

- Estrutura inicial de diretórios para frontend, backend e banco.
- Script SQL inicial com a tabela `ranking`.
- Classe `Database` para conexão MySQL via PDO.
- Classe `ScoreRepository` para salvar resultados e consultar o Top 10.

Ainda não foram implementados o motor do jogo em JavaScript, as telas, as rotas da API e a integração de ponta a ponta com um servidor MySQL.
