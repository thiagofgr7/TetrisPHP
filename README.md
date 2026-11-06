# TetrisPHP

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

## Executar localmente

1. Inicie o MySQL e importe `database/schema.sql`.
2. Na raiz do projeto, execute:

   ```bash
   php -S 127.0.0.1:8000
   ```

3. Acesse [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

O servidor embutido do PHP é destinado somente a desenvolvimento local. Confira a [documentação de instalação e testes](docs/wiki/Instalacao-e-Configuracao.md).

## Testes automatizados

Com Node.js 18 ou superior, execute a suíte determinística do motor:

```bash
node --test tests/srs.test.js
```

Ela cobre transições SRS, kicks, peças I/O, bloqueios, Hold e T-Spin. A suíte não realiza teste de navegador nem integração PHP/MySQL.

## Próxima etapa

Implementar o modo Time Attack com três fases: fácil, média e difícil.

## Documentação

Acesse [docs/wiki/](docs/wiki/Home.md) para arquitetura, banco, backend, regras do jogo e histórico.
