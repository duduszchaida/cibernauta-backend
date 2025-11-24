import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('=== Criar Conta de Administrador ===\n');

  const email = await question('Digite o email da conta: ');

  if (!email || !email.includes('@')) {
    console.error('Email inválido!');
    rl.close();
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_email: email },
    });

    if (!user) {
      console.error(`\nUsuário com email "${email}" não encontrado!`);
      console.log(
        '\nCrie primeiro uma conta pelo sistema: http://localhost:5173',
      );
      rl.close();
      return;
    }

    if (user.role === 'ADMIN' && user.admin) {
      console.log('\nEste usuário já é um administrador!');
      rl.close();
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { user_email: email },
      data: {
        role: 'ADMIN',
        admin: true,
      },
    });

    try {
      await admin.auth().updateUser(user.firebase_uid, {
        emailVerified: true,
      });
      console.log('\n✓ Email verificado automaticamente no Firebase');
    } catch (firebaseError) {
      console.warn('\n⚠ Aviso: Não foi possível verificar o email automaticamente');
      console.log('  Você precisará verificar o email manualmente.');
    }

    console.log('\n✓ Usuário promovido a administrador com sucesso!');
    console.log('\nDetalhes da conta:');
    console.log(`  Nome: ${updatedUser.full_name}`);
    console.log(`  Username: ${updatedUser.username}`);
    console.log(`  Email: ${updatedUser.user_email}`);
    console.log(`  Role: ${updatedUser.role}`);
  } catch (error) {
    console.error('\nErro ao promover usuário:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
