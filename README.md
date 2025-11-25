## ATENÇÃO!!!

Nosso projeto está hospedado na vercel e pode ser acessado em https://cibernauta-frontend.vercel.app/, mas caso deseja recria-lo localmente só seguir os passos abaixo:

## Pré-requisitos

- Node.js 22
- PostgreSQL 14

## Instalação Rápida

### 1. Instalar Dependências

```bash
# Backend
# Navegar até o projeto do back e instalar pacotes do node
cd cibernauta-backend
npm install

# Frontend
# Navegar até o projeto do front e instalar pacotes do node
cd cibernauta-frontend
npm install
```

### 2. Configurar Banco de Dados

O projeto já está configurado para usar um banco PostgreSQL remoto que esta hospedado em uma virtual machine da Oracle. Caso deseje usar nosso banco e nosso projeto do Firabase substitua o conteúdo dos arquivos .env dos projetos front-end e back-end pelo conteúdo dos arquivos ".env-frontend" e ".env-backend" presentes em cada projeto (apenas na versão enviada por arquivo compactado, pois eles incluiem informações vitais). Se preferir usar um banco local, edite em .env pelos acessos do seu banco que prefirir.

Exemplo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/cibernauta?schema=public"
```

### 3. Inicializar Banco de Dados, faça esse passo caso queira criar um banco local, caso não, apenas pule essa etapa

```bash
# Navegar até o projeto do back
cd cibernauta-backend

# Criar tabelas
npx prisma migrate deploy

# Popular com dados de exemplo
npx prisma db seed
```

### 4. Iniciar Aplicação

```bash
# Terminal 1 - Backend
cd cibernauta-backend
npx prisma generate
npm run start:dev

# Terminal 2 - Frontend
cd cibernauta-frontend
npm run dev
```

Acesse: `http://localhost:5173`

## Criar Conta de Administrador

### Caso esteja usando nosso banco, o usuario [...] senha: [...] tem acesso admin, mas caso criou um banco totalmente novo siga os passos abaixo

### 1. Criar Conta e torna-lá admin

- Acesse `http://localhost:5173`
- Clique em "Cadastrar-se"
- Preencha os dados e crie sua conta

### Você terá duas opções

## 1- Opção

Verificar a conta que você criou, pois chegará um email na conta que você utilizou no cadastro com o link para confirmação.
Depois rodar no banco o comando `UPDATE users SET role = 'ADMIN' WHERE user_email = 'seu-email@example.com';`,
altere seu-email@example.com pelo seu email utilizado no cadastro.

## 2- Opção

Volte ao terminal do backend (Terminal 1) e execute:

```bash
npm run create-admin
```

Quando solicitado, digite o email que você usou no cadastro.

O script irá:

- Promover sua conta para administrador
- Verificar automaticamente o email (sem necessidade de clicar em links de verificação)

Agora você tem acesso completo ao sistema.

## Portas Utilizadas

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

### Erro ao conectar com banco

Verifique se o PostgreSQL está rodando e as credenciais em `.env` estão corretas.

### Erro de autenticação

As credenciais do Firebase já estão configuradas nos arquivos `.env`. Se houver problemas, verifique se os valores estão corretos.
