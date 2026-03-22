# Documentação da API de Autenticação

Este documento descreve as rotas de autenticação implementadas no backend para suportar o fluxo de verificação de email, cadastro automático na primeira vez e login com senha.

---

## Visão Geral do Fluxo

1. **Verificação de Email** → Usuário insere email
2. **Primeira Vez?** → Se não existir, solicita Senha + Nome
3. **Cadastro Automático** → Cria novo usuário com senha criptografada
4. **Login Padrão** → Se existir, solicita apenas Senha
5. **Validação de Senha** → Compara com hash armazenado

---

## Endpoints da API

### 1. Verificar se Email Existe

**Endpoint:** `POST /api/auth/check-email`

**Descrição:** Verifica se um email já está registrado no sistema.

**Request Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response (Email não existe):**
```json
{
  "exists": false
}
```

**Response (Email existe):**
```json
{
  "exists": true,
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nome do Usuário",
    "role": "user"
  }
}
```

**Status HTTP:** 200 (sucesso), 400 (erro de validação), 500 (erro do servidor)

---

### 2. Registrar Novo Usuário (Primeiro Acesso)

**Endpoint:** `POST /api/auth/register`

**Descrição:** Cria um novo usuário com email, senha e nome. Só funciona se o email não existir.

**Request Body:**
```json
{
  "email": "novousuario@example.com",
  "password": "SenhaSegura123",
  "name": "Novo Usuário"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "user": {
    "id": 1,
    "email": "novousuario@example.com",
    "name": "Novo Usuário",
    "role": "user"
  }
}
```

**Response (Email já existe):**
```json
{
  "success": false,
  "message": "Usuário já existe com este email",
  "error": "USER_EXISTS"
}
```

**Response (Senha muito curta):**
```json
{
  "success": false,
  "message": "Senha deve ter no mínimo 6 caracteres",
  "error": "PASSWORD_TOO_SHORT"
}
```

**Response (Campos obrigatórios faltando):**
```json
{
  "success": false,
  "message": "Email, senha e nome são obrigatórios",
  "error": "MISSING_FIELDS"
}
```

**Status HTTP:** 200 (sucesso), 400 (erro de validação), 500 (erro do servidor)

**Nota:** Um cookie de sessão é automaticamente definido após o registro bem-sucedido.

---

### 3. Fazer Login (Acessos Seguintes)

**Endpoint:** `POST /api/auth/login`

**Descrição:** Autentica um usuário existente com email e senha.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "SenhaSegura123"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Usuário",
    "role": "user"
  }
}
```

**Response (Credenciais inválidas):**
```json
{
  "success": false,
  "message": "Email ou senha incorretos",
  "error": "INVALID_CREDENTIALS"
}
```

**Response (Campos obrigatórios faltando):**
```json
{
  "success": false,
  "message": "Email e senha são obrigatórios",
  "error": "MISSING_FIELDS"
}
```

**Status HTTP:** 200 (sucesso), 401 (não autorizado), 400 (erro de validação), 500 (erro do servidor)

**Nota:** Um cookie de sessão é automaticamente definido após o login bem-sucedido.

---

### 4. Fazer Logout

**Endpoint:** `POST /api/auth/logout`

**Descrição:** Encerra a sessão do usuário e limpa o cookie de autenticação.

**Request Body:** (vazio)

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Status HTTP:** 200 (sucesso), 500 (erro do servidor)

---

## Fluxo de Implementação no Frontend

### Passo 1: Verificar Email
```javascript
const response = await fetch('/api/auth/check-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
});

const data = await response.json();

if (data.exists) {
  // Email existe → Mostrar tela de LOGIN
  // Solicitar apenas: Email e Senha
} else {
  // Email não existe → Mostrar tela de REGISTRO
  // Solicitar: Email, Senha e Nome
}
```

### Passo 2: Registrar Novo Usuário (se não existir)
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email,
    password,
    name
  })
});

const data = await response.json();

if (data.success) {
  // Usuário registrado com sucesso
  // Redirecionar para dashboard
} else {
  // Mostrar erro: data.message
}
```

### Passo 3: Fazer Login (se existir)
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email,
    password
  })
});

const data = await response.json();

if (data.success) {
  // Login bem-sucedido
  // Redirecionar para dashboard
} else {
  // Mostrar erro: data.message
}
```

### Passo 4: Fazer Logout
```javascript
const response = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

const data = await response.json();

if (data.success) {
  // Logout bem-sucedido
  // Redirecionar para login
}
```

---

## Segurança

### Criptografia de Senha
- **Algoritmo:** PBKDF2 com SHA-512
- **Iterações:** 100.000
- **Salt:** Gerado aleatoriamente para cada senha
- **Formato armazenado:** `salt:hash`

### Sessão
- **Cookie:** Definido automaticamente após login/registro bem-sucedido
- **Duração:** 1 ano
- **Segurança:** HttpOnly (não acessível via JavaScript)

### Validações
- Email é obrigatório e validado
- Senha mínima de 6 caracteres
- Proteção contra força bruta (implementar no frontend com rate limiting)

---

## Códigos de Erro

| Erro | Descrição |
|------|-----------|
| `USER_EXISTS` | Email já registrado no sistema |
| `PASSWORD_TOO_SHORT` | Senha com menos de 6 caracteres |
| `MISSING_FIELDS` | Campos obrigatórios não preenchidos |
| `INVALID_CREDENTIALS` | Email ou senha incorretos |
| `NO_PASSWORD_SET` | Usuário não foi registrado com senha |
| `REGISTRATION_ERROR` | Erro genérico ao registrar |
| `LOGIN_ERROR` | Erro genérico ao fazer login |

---

## Exemplo Completo de Uso

```javascript
// 1. Usuário insere email
const email = "usuario@example.com";

// 2. Verificar se email existe
const checkResponse = await fetch('/api/auth/check-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
});

const checkData = await checkResponse.json();

if (checkData.exists) {
  // Email existe - Pedir senha
  const password = prompt("Digite sua senha:");
  
  const loginResponse = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const loginData = await loginResponse.json();
  
  if (loginData.success) {
    console.log("Login bem-sucedido!", loginData.user);
    // Redirecionar para dashboard
  } else {
    console.error("Erro:", loginData.message);
  }
} else {
  // Email não existe - Pedir senha e nome
  const password = prompt("Crie uma senha:");
  const name = prompt("Digite seu nome:");
  
  const registerResponse = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  
  const registerData = await registerResponse.json();
  
  if (registerData.success) {
    console.log("Usuário registrado com sucesso!", registerData.user);
    // Redirecionar para dashboard
  } else {
    console.error("Erro:", registerData.message);
  }
}
```

---

## Notas Importantes

1. **Cookies:** Os cookies de sessão são definidos automaticamente pelo backend. O frontend não precisa gerenciá-los manualmente.

2. **CORS:** Se o frontend estiver em um domínio diferente, certifique-se de que CORS está configurado corretamente.

3. **HTTPS:** Em produção, sempre use HTTPS para proteger as credenciais em trânsito.

4. **Rate Limiting:** Implemente rate limiting no frontend para evitar força bruta.

5. **Validação:** Valide os dados no frontend antes de enviar para melhor UX.

---

## Testes

Todos os endpoints foram testados com Vitest. Execute os testes com:

```bash
pnpm test
```

Os testes cobrem:
- ✅ Hashing e verificação de senha
- ✅ Verificação de email
- ✅ Registro de novo usuário
- ✅ Login com credenciais corretas
- ✅ Rejeição de credenciais incorretas
- ✅ Atualização de senha
- ✅ Fluxo completo de autenticação
