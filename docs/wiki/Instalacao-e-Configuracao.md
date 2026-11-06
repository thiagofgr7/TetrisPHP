# Instalação e configuração local

## Requisitos

- PHP com extensão PDO e driver PDO MySQL habilitados.
- MySQL ou MariaDB compatível com o schema utilizado.
- Servidor web local, como Apache via XAMPP, ou servidor embutido do PHP.

## 1. Clonar o repositório

```bash
git clone https://github.com/thiagofgr7/TetrisPHP.git
cd TetrisPHP
```

## 2. Criar o banco de dados

Importe o arquivo `database/schema.sql` pelo phpMyAdmin ou execute:

```bash
mysql -u root -p < database/schema.sql
```

O script cria o banco `tetrisphp` e a tabela `ranking`.

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

Exemplo de configuração no terminal (Linux/macOS):

```bash
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_NAME=tetrisphp
export DB_USER=tetris_user
export DB_PASS='sua_senha_local'
```

No Windows, configure as mesmas variáveis no ambiente do processo que executa o Apache/PHP.

## 4. Usar a conexão

A classe pode ser incluída assim, ajustando o caminho relativo ao arquivo chamador:

```php
require_once __DIR__ . '/../src/Database.php';

$pdo = Database::getConnection();
```

A conexão é reutilizada durante a requisição PHP atual.

## Situação dos testes

A presença dos arquivos no GitHub foi verificada. A conexão ainda precisa ser testada em um ambiente com PHP, MySQL e credenciais configuradas.
