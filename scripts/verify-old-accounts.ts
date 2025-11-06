import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';


dotenv.config({ path: path.resolve(__dirname, '../.env') });


const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const prisma = new PrismaClient();

interface VerificationResult {
  email: string;
  username: string;
  success: boolean;
  wasAlreadyVerified: boolean;
  error?: string;
}

async function verifyOldAccounts(cutoffDate?: Date) {
  

  const results: VerificationResult[] = [];

  try {

    const whereClause = cutoffDate
      ? { created_at: { lt: cutoffDate } }
      : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        firebase_uid: true,
        user_email: true,
        username: true,
        created_at: true,
      },
    });

    

    if (users.length === 0) {
      console.log('Nenhum usuário encontrado.');
      return;
    }

    for (const user of users) {
      try {
       

        
        const firebaseUser = await admin.auth().getUser(user.firebase_uid);

        if (firebaseUser.emailVerified) {
          
          results.push({
            email: user.user_email,
            username: user.username,
            success: true,
            wasAlreadyVerified: true,
          });
        } else {
          
          await admin.auth().updateUser(user.firebase_uid, {
            emailVerified: true,
          });

          
          results.push({
            email: user.user_email,
            username: user.username,
            success: true,
            wasAlreadyVerified: false,
          });
        }
      } catch (error: any) {
        
        results.push({
          email: user.user_email,
          username: user.username,
          success: false,
          wasAlreadyVerified: false,
          error: error.message,
        });
      }
    }

 

    const verified = results.filter((r) => r.success && !r.wasAlreadyVerified).length;
    const alreadyVerified = results.filter((r) => r.wasAlreadyVerified).length;
    const failed = results.filter((r) => !r.success).length;



    if (failed > 0) {
     
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`  - ${r.email} (${r.username}): ${r.error}`);
        });
    }

   
  } catch (error) {
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}


const args = process.argv.slice(2);
const dateArg = args[0];

if (dateArg === '--help' || dateArg === '-h') {
  console.log(`
Uso: npm run verify-old-accounts [data-de-corte]

Opções:
  [data-de-corte]  Data no formato YYYY-MM-DD. Apenas contas criadas antes
                   desta data serão verificadas. Se omitido, todas as contas
                   serão processadas.
  --help, -h       Mostra esta mensagem de ajuda.

Exemplos:
  npm run verify-old-accounts                    # Verifica todas as contas
  npm run verify-old-accounts 2025-01-01         # Verifica contas criadas antes de 01/01/2025
  `);
  process.exit(0);
}

const cutoffDate = dateArg ? new Date(dateArg) : undefined;

if (cutoffDate && isNaN(cutoffDate.getTime())) {
  console.error('❌ Data inválida. Use o formato YYYY-MM-DD (ex: 2025-01-01)');
  process.exit(1);
}

verifyOldAccounts(cutoffDate)
  .then(() => {
    
    process.exit(0);
  })
  .catch((error) => {
    
    process.exit(1);
  });
