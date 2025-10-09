// src/firebase/firebase.config.ts
import * as admin from 'firebase-admin';

export const initializeFirebase = () => {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Credenciais do Firebase não configuradas no .env');
    }

    
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });

    console.log('Firebase Admin inicializado com sucesso!');
  }
  return admin;
};