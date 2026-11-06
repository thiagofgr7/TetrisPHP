# Instalação, configuração e testes locais

## Requisitos

- PHP 7.4 ou superior, com extensões PDO e PDO MySQL habilitadas.
- MySQL ou MariaDB compatível com o schema utilizado.
- XAMPP, Apache ou servidor embutido do PHP para desenvolvimento.

## 1. Clonar o repositório

```bash
git clone https://github.com/thiagofgr7/TetrisPHP.git
cd TetrisPHP
```

No Windows com XAMPP, o projeto pode ficar em `C:\\xampp\\htdocs\\TetrisPHP`.

## 2. Iniciar o MySQL e criar o banco

1. Abra o painel do XAMPP.
2. Inicie o serviço **MySQL**.
3. Abra o phpMyAdmin em `http://localhost/phpmyadmin`.
4. Clique em **Importar**, selecione `database/schema.sql` e execute.

O script cria o banco `tetrisphp` e a tabela `ranking`.

Também é possível importar pelo terminal:

```bash
mysql -u root -p < database/schema.sql
```

Se o usuário local `root` não tiver senha, remova `-p` ou apenas pressione Enter quando solicitada.

## 3. Configurar a conexão

A classe `src/Database.php` lê estas variáveis de ambiente:

| Variável | Valor padrão local |
|---|---|
| `DB_HOST` | `127.0.0.1` |
| `DB_PORT` | `3306` |
| `DB_NAME` | `tetrisphp` |
| `DB_USER` | `root` |
| `DB_PASS` | string vazia |

Os padrões são convenientes para uma instalação local comum do XAMPP. Em produção, configure usuário e senha exclusivos, com privilégios mínimos. Não publique credenciais no Git.

Exemplo no PowerShell para a sessão atual:

```powershell
$env:DB_HOST = "127.0.0.1"
$env:DB_PORT = "3306"
$env:DB_NAME = "tetrisphp"
$env:DB_USER = "root"
$env:DB_PASS = ""
```

No Linux/macOS:

```bash
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_NAME=tetrisphp
export DB_USER=root
export DB_PASS=''
```

Se você usar XAMPP com usuário `root` sem senha, não precisa definir essas variáveis: os valores padrão já correspondem a essa configuração.

## 4. Conferir as extensões do PHP

No terminal:

```bash
php -m
```

Confirme que aparecem `PDO` e `pdo_mysql`. No Windows, também pode filtrar a lista:

```powershell
php -m | findstr /I "PDO pdo_mysql"
```

Se `pdo_mysql` não aparecer, habilite a extensão no `php.ini` usado pelo PHP e reinicie o Apache/servidor.

## 5. Iniciar a API localmente

Com o terminal aberto na pasta raiz do projeto (`TetrisPHP`), execute:

```bash
php -S 127.0.0.1:8000
```

Mantenha esse terminal aberto. O servidor embutido do PHP é apenas para desenvolvimento e testes, não para produção.

As rotas serão:

- `http://127.0.0.1:8000/api/save-score.php`
- `http://127.0.0.1:8000/api/get-ranking.php`

Também é possível usar o Apache do XAMPP: com o projeto dentro de `htdocs/TetrisPHP` e Apache/MySQL iniciados, use `http://localhost/TetrisPHP/api/...`.

## 6. Testar a consulta do ranking

Cole no navegador:

```text
http://127.0.0.1:8000/api/get-ranking.php?mode=infinite
```

A primeira resposta esperada, se ainda não houver partidas, é semelhante a:

```json
{
  "success": true,
  "game_mode": "infinite",
  "count": 0,
  "ranking": []
}
```

Isso já confirma que o PHP conseguiu abrir a conexão com o MySQL e consultar a tabela.

Para consultar o ranking do Time Attack:

```text
http://127.0.0.1:8000/api/get-ranking.php?mode=time_attack
```

## 7. Registrar uma pontuação de teste

### Windows (PowerShell)

Abra outro terminal PowerShell e execute:

```powershell
$body = @{
    player_name = "abc"
    game_mode = "infinite"
    score = 1200
    duration_seconds = 95
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/save-score.php" -ContentType "application/json" -Body $body
```

Resposta esperada:

```json
{
  "success": true,
  "message": "Pontuação registrada com sucesso.",
  "id": 1
}
```

O ID será gerado pelo banco e pode ser diferente de 1.

Agora atualize a consulta do ranking no navegador. A entrada `ABC` deverá aparecer com 1200 pontos.

### Linux/macOS (cURL)

```bash
curl -i -X POST http://127.0.0.1:8000/api/save-score.php \
  -H "Content-Type: application/json" \
  -d '{"player_name":"abc","game_mode":"infinite","score":1200,"duration_seconds":95}'
```

Depois consulte:

```bash
curl "http://127.0.0.1:8000/api/get-ranking.php?mode=infinite"
```

## 8. Testar o Time Attack

Repita o POST usando `"game_mode": "time_attack"` e outra pontuação. Consulte:

```text
http://127.0.0.1:8000/api/get-ranking.php?mode=time_attack
```

As modalidades possuem rankings independentes.

## 9. Testar validações

Tente salvar um nome com quatro letras (`"player_name": "ABCD"`) ou uma modalidade inválida. A API deve responder com HTTP 422 para os dados inválidos no cadastro.

Tente consultar `?mode=outro`. A API deve responder com HTTP 400.

Tente abrir `save-score.php` diretamente no navegador. Como a rota exige POST, a resposta esperada é HTTP 405.

## Solução de problemas

- **HTTP 500:** confira se o MySQL está ativo, se o schema foi importado no banco `tetrisphp` e se as credenciais estão corretas. Consulte o log do Apache/PHP no XAMPP.
- **Erro de driver PDO:** habilite `pdo_mysql` no `php.ini` e reinicie o servidor.
- **Conexão recusada na porta 8000:** confirme que o servidor embutido do PHP está rodando e que o terminal continua aberto.
- **Tabela não encontrada:** importe novamente `database/schema.sql` no banco correto.

## Observações de segurança

O servidor embutido do PHP é destinado somente a desenvolvimento local. O endpoint de gravação recebe pontuação informada pelo navegador; portanto, ainda é possível forjar requisições manualmente. Antes de publicar o jogo, será necessário implementar proteção contra adulteração de pontuação e limitar o volume de requisições.
