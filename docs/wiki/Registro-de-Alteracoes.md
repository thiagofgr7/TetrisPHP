# Registro de alterações

Este arquivo registra as mudanças técnicas feitas no repositório e as decisões associadas.

## Estado inicial

O repositório continha o README inicial com a descrição do projeto Tetris em PHP.

## Estrutura de diretórios

Foram adicionados:

- `public/assets/css/`
- `public/assets/js/`
- `public/assets/audio/`
- `src/`
- `api/`
- `database/`

Como diretórios vazios não são versionados pelo Git, foram incluídos arquivos `.gitkeep`.

## Banco de dados

Foi criado `database/schema.sql`, com:

- Banco `tetrisphp` em `utf8mb4`.
- Tabela `ranking`.
- Nome do jogador limitado a três caracteres.
- Modalidade de jogo separada entre `infinite` e `time_attack`.
- Pontuação, duração opcional e data do registro.
- Índice para consultas de ranking.

## Conexão

Foi criado `src/Database.php`, responsável por centralizar a conexão PDO e ler credenciais de variáveis de ambiente.

## Repositório de pontuações

Foi criado `src/ScoreRepository.php`, responsável por:

- Validar iniciais e modalidade.
- Normalizar as iniciais com `strtoupper()`.
- Limitar o comprimento usando `strlen()`.
- Evitar valores negativos com `max()`.
- Salvar pontuações com prepared statements.
- Retornar o Top 10 por modalidade.

## API HTTP

Foram criados:

- `api/save-score.php`: endpoint POST que recebe JSON, valida os campos e grava a pontuação.
- `api/get-ranking.php`: endpoint GET que retorna os dez melhores resultados por modalidade.

Os endpoints retornam JSON, códigos HTTP apropriados e mensagens genéricas para falhas internas.

## Verificações técnicas

- Os endpoints passaram por `php -l` sem erros de sintaxe.
- Testes HTTP locais confirmaram as respostas 405 para métodos não permitidos.
- JSON malformado no endpoint de gravação retornou HTTP 400.
- A conexão real com MySQL não foi testada neste ambiente porque o driver `pdo_mysql` não está instalado.

## Testes e documentação

A documentação de instalação foi ampliada com instruções para iniciar o servidor PHP, verificar as extensões PDO, registrar uma pontuação de teste e consultar o ranking no PowerShell ou cURL.

A documentação versionada em `docs/wiki/` deve ser atualizada a cada mudança relevante. Ela serve como fonte de documentação e espelho preparado para a Wiki do GitHub; ainda não foi publicada no espaço Wiki separado do repositório.
