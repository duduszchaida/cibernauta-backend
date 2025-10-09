import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { initializeFirebase } from '../firebase/firebase.config';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        return initializeFirebase();
      },
    },
    AuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}