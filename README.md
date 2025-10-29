# Cibernauta - IFPR


## Tecnologias Utilizadas

### Backend
- NestJS - Framework Node.js para APIs
- TypeScript - Linguagem de programação
- PostgreSQL - Banco de dados relacional
- Prisma - ORM (Object-Relational Mapping)
- Firebase Admin SDK - Autenticação

### Frontend
- React 18 - Biblioteca JavaScript
- Vite - Build tool e dev server
- TypeScript - Linguagem de programação
- Tailwind CSS - Framework de estilização
- Firebase - Autenticação
---

## Pré-requisitos

Certifique-se de ter instalado:

   Node.js (versão 18 ou superior)
   PostgreSQL (versão 12 ou superior)

---

## Instalação

### Passo 1: Preparar o Ambiente

Abra o terminal/prompt de comando e navegue até a pasta do projeto:

cd C:\Users\eduar\Documents\IFPR\projeto

### Passo 2: Instalar Dependências do Backend

cd cibernauta-backend
npm install

Este comando instalará todas as dependências necessárias do backend (NestJS, Prisma, Firebase, etc.).

### Passo 3: Instalar Dependências do Frontend

Abra outra janela do terminal/promp, vá até a pasta do projeto e instale as dependências do frontend:

cd cibernauta-frontend
npm install

Este comando instalará todas as dependências do frontend (React, Vite, Tailwind CSS, etc.).

---

## Configuração

### Passo 1: Iniciar o Backend

No terminal na pasta cibernauta-backend:

npm run start:dev

O servidor backend estará rodando em: http://localhost:3001

### Passo 2: Iniciar o Frontend

No outro terminal na pasta cibernauta-frontend:

npm run dev

O servidor frontend estará rodando em: http://localhost:5173

### Passo 3: Acessar o Sistema

Abra seu navegador e acesse: http://localhost:5173

---

## Navegação e Uso

### 1. Página Inicial

Ao acessar http://localhost:5173, você verá a página inicial do sistema.

### 2. Cadastro de Usuário

1. Clique no botão "Cadastrar-se"
2. Preencha o formulário com:
   - Nome
   - Email
   - Senha (mínimo 6 caracteres)
3. Clique em "Criar conta"
4. Você será redirecionado automaticamente após o cadastro

### 3. Login

1. Se já tiver uma conta, insira seu email e senha
3. Clique em "Entrar"

### 4. Dashboard de Jogos

Após o login, você será redirecionado para o dashboard com:

- Lista de Jogos Disponíveis: Visualize todos os jogos cadastrados
- Informações do Jogo: Título, descrição, dificuldade, imagem

### 5. Jogando

1. Na lista de jogos, clique no card de um jogo específico
2. Você será redirecionado para a tela do jogo
3. Seu progresso e pontuação serão salvos automaticamente


### 6. Área Administrativa

Se sua conta tiver permissões de administrador:

1. Criar Novo Jogo:
   - Clique em "Criar Jogo" no dashboard de games
   - Preencha: título, descrição, dificuldade, URL da imagem
   - Clique em "Salvar"

2. Editar Jogo:
   - Na lista de jogos, clique em "Editar"
   - Modifique os campos necessários
   - Clique em "Salvar Alterações"

3. Excluir Jogo:
   - Na lista de jogos, clique em "Excluir"
   - Confirme a exclusão
