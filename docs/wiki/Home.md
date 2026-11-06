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
- [Instalação e configuração local e testes](Instalacao-e-Configuracao.md)
- [Banco de dados](Banco-de-Dados.md)
- [Backend, endpoints e funções PHP](Backend-PDO-e-Ranking.md)
- [Registro de alterações](Registro-de-Alteracoes.md)

## Estado atual

Já foram adicionados:

- Estrutura inicial de diretórios para frontend, backend e banco.
- Script SQL inicial com a tabela `ranking`.
- Classe `Database` para conexão MySQL via PDO.
- Classe `ScoreRepository` para salvar resultados e consultar o Top 10.
- Endpoint `POST /api/save-score.php` para registrar pontuações.
- Endpoint `GET /api/get-ranking.php` para consultar o Top 10.
- Instruções para testar os endpoints localmente.

Ainda não foram implementados o motor do jogo em JavaScript, as telas e a integração da interface com a API. A conexão real com MySQL também precisa ser testada no ambiente local do desenvolvedor.
