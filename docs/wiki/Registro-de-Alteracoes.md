# Registro de alterações

Este arquivo registra as mudanças técnicas feitas no repositório e as decisões associadas.

## Fundação do projeto

- Criada a estrutura inicial de diretórios para frontend, backend e banco.
- Criado `database/schema.sql` com banco `tetrisphp` e tabela `ranking`.
- Criada `src/Database.php` para conexão PDO com configurações por ambiente.
- Criada `src/ScoreRepository.php` para salvar pontuações e consultar o Top 10.
- Criados `api/save-score.php` e `api/get-ranking.php` para operações JSON da API.

## Interface e motor do jogo

- Criado `index.php` como ponto de entrada na raiz e `public/index.php` como página da interface.
- Criado `public/assets/css/style.css` com visual retrô monocromático, responsivo e sem dependências externas.
- Criado `public/assets/js/game.js` com tabuleiro 10×20, sete peças, bolsa de peças, rotação, detecção de colisão, queda, limpeza de linhas, pontuação, níveis e pausa.
- Criado `public/assets/js/interface.js` com teclado, botões, controles de toque e atualização dos indicadores.

## Verificações da versão jogável

- Os arquivos JavaScript passaram pela verificação de sintaxe.
- Uma simulação do motor com Canvas mockado exercitou inicialização, movimento lateral, quedas rápidas e encerramento da partida sem erro de execução.
- A conferência visual em navegador real ainda deve ser feita localmente.

## Escopo da versão jogável

A interface atual é uma build de teste do motor. Ela não implementa ainda os modos finais, as três fases do Time Attack, a dificuldade progressiva do modo Infinito, nem a tela de iniciais e integração de resultado com o ranking.

## Processo de documentação

A documentação versionada em `docs/wiki/` deve ser atualizada a cada mudança relevante. Ela serve como fonte de documentação e espelho preparado para a Wiki do GitHub; ainda não foi publicada no espaço Wiki separado do repositório.
