# Instalação, configuração e testes locais

## Requisitos

- PHP com extensões PDO e PDO MySQL habilitadas.
- MySQL ou MariaDB compatível com o schema.
- XAMPP/Apache ou servidor embutido do PHP para desenvolvimento.

## 1. Obter o projeto

```bash
git clone https://github.com/thiagofgr7/TetrisPHP.git
cd TetrisPHP
```

Se já tiver o repositório local:

```bash
git pull origin main
```

## 2. Criar o banco de dados

Inicie o MySQL no XAMPP e importe `database/schema.sql` pelo phpMyAdmin. O script cria o banco `tetrisphp` e a tabela `ranking`.

Também é possível importar pelo terminal:

```bash
mysql -u root -p < database/schema.sql
```

## 3. Configurar a conexão

A classe `src/Database.php` lê:

| Variável | Padrão local |
|---|---|
| `DB_HOST` | `127.0.0.1` |
| `DB_PORT` | `3306` |
| `DB_NAME` | `tetrisphp` |
| `DB_USER` | `root` |
| `DB_PASS` | vazio |

No XAMPP local, os padrões normalmente funcionam sem configuração adicional. Em produção, use um usuário exclusivo e não publique credenciais no Git.

## 4. Conferir o PHP

```powershell
php -m | findstr /I "PDO pdo_mysql"
```

Confirme que aparecem `PDO` e `pdo_mysql`. Se não aparecerem, habilite `pdo_mysql` no `php.ini` usado pelo servidor e reinicie-o.

## 5. Iniciar o servidor

Na pasta raiz do projeto:

```bash
php -S 127.0.0.1:8000
```

Acesse [http://127.0.0.1:8000/](http://127.0.0.1:8000/). O servidor embutido é apenas para desenvolvimento.

Com Apache do XAMPP, se o projeto estiver em `htdocs/TetrisPHP`, acesse `http://localhost/TetrisPHP/`.

## 6. Testar o modo Infinito

1. Clique em **INICIAR MODO INFINITO**.
2. Use as setas, Espaço, C e P para jogar (ou os botões de toque no celular).
3. O nível aumenta a cada 30 segundos.
4. A dificuldade fica limitada ao nível 10, alcançado aos 4 minutos e 30 segundos.
5. A pausa interrompe o cronômetro e a progressão.
6. Quando o jogo terminar, informe de uma a três letras A-Z e clique em **SALVAR PONTUAÇÃO**.
7. A aplicação grava a pontuação no MySQL e mostra o Top 10 do modo Infinito.

## 7. Testar Hold

1. Inicie uma partida e observe a peça atual.
2. Pressione **C** ou clique no botão **HOLD** em dispositivos de toque.
3. A peça atual vai para o painel **PEÇA GUARDADA**, e a próxima peça da fila entra no tabuleiro.
4. Pressione Hold novamente antes de fixar a peça: a ação deve ser ignorada.
5. Fixe a peça atual; a opção Hold será liberada para a nova peça.
6. Use Hold novamente para trocar a peça ativa pela que estava guardada.

A tecla padrão é C, mas pode ser alterada pelo menu **TECLAS**. A peça recuperada volta à posição e orientação iniciais.

## 8. Testar T-Spin

O reconhecimento usa a peça T, uma rotação válida e três dos quatro cantos diagonais ao redor do pivô ocupados por blocos, parede ou piso.

- **T-Spin Full:** os dois cantos frontais estão ocupados ou foi necessário um deslocamento lateral de duas colunas durante a rotação.
- **T-Spin Mini:** há três cantos ocupados, mas a condição de Full não foi atingida.

Monte um encaixe em T próximo a blocos, parede ou piso, gire a peça para entrar no espaço e fixe-a sem fazer outro movimento manual após a rotação. O indicador **ÚLTIMA JOGADA** deve mostrar o tipo de T-Spin e a pontuação deve aumentar conforme a tabela da documentação do motor.

A detecção atual é uma versão simplificada sobre a rotação 4×4 e os kicks horizontais existentes; não é ainda um sistema SRS completo.

## 9. Personalizar os controles

Clique em **TECLAS** na barra superior. Para trocar uma ação:

1. Clique no botão da ação desejada.
2. Pressione a nova tecla no teclado.
3. A tecla aparece ao lado da ação e é salva neste navegador.
4. Repita para as demais ações, inclusive **GUARDAR PEÇA**.
5. Clique em **RESTAURAR PADRÕES** para voltar às setas, Espaço, C e P.

Não é possível atribuir a mesma tecla a duas ações. Teclas reservadas pelo navegador (Tab, Enter, Esc, F5 etc.) são bloqueadas. As preferências ficam no armazenamento local do navegador e não são compartilhadas entre dispositivos.

## 10. Consultar ranking diretamente

- Modo Infinito: [http://127.0.0.1:8000/api/get-ranking.php?mode=infinite](http://127.0.0.1:8000/api/get-ranking.php?mode=infinite)
- Time Attack: [http://127.0.0.1:8000/api/get-ranking.php?mode=time_attack](http://127.0.0.1:8000/api/get-ranking.php?mode=time_attack)

O endpoint de gravação é `POST /api/save-score.php` e recebe JSON.

## Solução de problemas

- **HTTP 500:** verifique MySQL, schema, usuário e senha; consulte o log do Apache/PHP.
- **Erro de driver PDO:** habilite `pdo_mysql` no `php.ini`.
- **Página sem CSS:** confirme que `public/assets/css/style.css` existe e recarregue com `Ctrl + F5`.
- **Conexão recusada na porta 8000:** confirme que o servidor PHP está rodando e que o terminal continua aberto.
- **Falha ao salvar o score:** confirme a conexão MySQL e a tabela `ranking`.

## Limites de segurança

A pontuação é calculada no navegador e enviada para o backend. Embora o endpoint valide tipos, limites e iniciais, ainda é possível forjar uma requisição manual. Antes de publicar, implemente proteção antifraude e limitação de requisições.
