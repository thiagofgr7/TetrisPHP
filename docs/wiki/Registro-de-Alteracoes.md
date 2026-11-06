# Registro de alterações

Este arquivo registra as mudanças técnicas feitas no repositório e as decisões associadas.

## Fundação do projeto

- Criada a estrutura inicial de diretórios para frontend, backend e banco.
- Criado `database/schema.sql` com banco `tetrisphp` e tabela `ranking`.
- Criada `src/Database.php` para conexão PDO com configurações por ambiente.
- Criada `src/ScoreRepository.php` para salvar pontuações e consultar o Top 10.
- Criados `api/save-score.php` e `api/get-ranking.php` para operações JSON da API.

## Correção de caminhos dos assets

A lógica de `public/index.php` foi ajustada para derivar o caminho público do projeto a partir de `DOCUMENT_ROOT`, com fallback baseado em `SCRIPT_NAME`. Isso evita que CSS e JavaScript recebam caminhos incorretos quando o repositório está em uma subpasta do servidor web.

## Interface e motor do jogo

- Criado `index.php` como ponto de entrada na raiz e `public/index.php` como página da interface.
- Criado `public/assets/css/style.css` com visual retrô monocromático, responsivo e sem dependências externas.
- Criado `public/assets/js/game.js` com tabuleiro 10×20, sete peças, bolsa de peças, rotação, detecção de colisão, queda, limpeza de linhas, pontuação, níveis e pausa.
- Criado `public/assets/js/interface.js` com teclado, botões, controles de toque e atualização dos indicadores.

## Revisão da identidade visual

- A interface foi retrabalhada para parecer uma tela de videogame CRT antigo, não um painel web moderno.
- Foram removidos gradientes de painel, sombras de cartão, botões com relevo moderno e detalhes arredondados.
- O gabinete da interface ganhou moldura de monitor, scanlines e vinheta.
- Os blocos do tabuleiro passaram a ser pixels sólidos, sem bevel ou brilho tridimensional.
- Os rótulos foram ajustados para a linguagem de arcade, mantendo a paleta preto e branco.

## Layout em tela cheia

- Removida a moldura externa e a largura máxima da página.
- A página passou a ocupar 100% da viewport, com rolagem desativada.
- O tabuleiro central passou a dimensionar-se pela altura livre da janela.
- Painéis laterais mantidos no desktop; em celular, indicadores compactos acima do tabuleiro e controles de toque abaixo.
- Adicionado limite de largura do tabuleiro para evitar cortes em celulares estreitos.

## Verificações da versão jogável

- Os arquivos JavaScript passaram pela verificação de sintaxe.
- Uma simulação do motor com Canvas mockado exercitou inicialização, movimento lateral, quedas rápidas e encerramento da partida sem erro de execução.
- A conferência visual em navegador real ainda deve ser feita localmente.

## Escopo da versão jogável

A interface atual é uma build de teste do motor. Ela não implementa ainda os modos finais, as três fases do Time Attack, a dificuldade progressiva do modo Infinito, nem a tela de iniciais e integração de resultado com o ranking.

## Processo de documentação

A documentação versionada em `docs/wiki/` deve ser atualizada a cada mudança relevante. Ela serve como fonte de documentação e espelho preparado para a Wiki do GitHub; ainda não foi publicada no espaço Wiki separado do repositório.
