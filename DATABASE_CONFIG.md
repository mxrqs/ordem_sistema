# 🗄️ Configuração de Banco de Dados

Este arquivo documenta como alterar o banco de dados do sistema.

## Banco de Dados Atual

**Tipo:** MySQL / TiDB  
**Variável de Ambiente:** `DATABASE_URL`  
**Localização:** Arquivo `.env` (não commitado no Git)

## Como Alterar o Banco de Dados

### 1. Localizar a String de Conexão

A string de conexão está armazenada em:
- **Desenvolvimento:** Variável de ambiente `DATABASE_URL` no arquivo `.env`
- **Produção:** Variável de ambiente `DATABASE_URL` no painel de configuração do Manus

### 2. Formato da String de Conexão

```
mysql://usuario:senha@host:porta/nome_banco_de_dados
```

**Exemplo:**
```
mysql://root:senha123@localhost:3306/ordem_sistema
```

### 3. Alterar para Outro Banco de Dados

#### Opção A: MySQL/MariaDB (Atual)
```
mysql://usuario:senha@host:porta/banco
```

#### Opção B: PostgreSQL
1. Instalar driver: `npm install pg`
2. Atualizar `drizzle.config.ts`:
```typescript
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```
3. String de conexão:
```
postgresql://usuario:senha@host:porta/banco
```

#### Opção C: SQLite
1. Instalar driver: `npm install better-sqlite3`
2. Atualizar `drizzle.config.ts`:
```typescript
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./data.db",
  },
});
```

### 4. Arquivos Importantes a Modificar

| Arquivo | Descrição |
|---------|-----------|
| `.env` | String de conexão (não commitado) |
| `drizzle.config.ts` | Configuração do Drizzle ORM |
| `server/db.ts` | Função de conexão com banco |
| `drizzle/schema.ts` | Definição das tabelas |

### 5. Passos para Migrar

1. **Backup dos dados atuais**
   ```bash
   # Exportar dados do MySQL
   mysqldump -u usuario -p banco_atual > backup.sql
   ```

2. **Atualizar configuração**
   - Editar `.env` com nova string de conexão
   - Editar `drizzle.config.ts` com novo dialect

3. **Regenerar migrations**
   ```bash
   pnpm drizzle-kit generate
   ```

4. **Aplicar migrations**
   - Executar SQL gerado via `webdev_execute_sql`

5. **Testar conexão**
   - Navegar para `/admin/dashboard`
   - Verificar se dados carregam corretamente

### 6. Variáveis de Ambiente Necessárias

```env
# Banco de dados
DATABASE_URL=mysql://usuario:senha@host:porta/banco

# OAuth (mantém igual)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=seu_jwt_secret

# Outros
OWNER_NAME=seu_nome
OWNER_OPEN_ID=seu_open_id
```

## Suporte

Para dúvidas sobre configuração de banco de dados, consulte:
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [MySQL Docs](https://dev.mysql.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
