import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    @Inject('FIREBASE_ADMIN') private firebaseAdmin: typeof admin,
  ) {}

  async register(registerDto: RegisterDto) {
    const { user_name, user_email, password } = registerDto;

    
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { user_email },
          { user_name },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email ou nome de usuário já existe');
    }

    try {
    
      const firebaseUser = await this.firebaseAdmin.auth().createUser({
        email: user_email,
        password: password,
        displayName: user_name,
      });

      const user = await this.prisma.user.create({
        data: {
          firebase_uid: firebaseUser.uid,
          user_name,
          user_email,
          admin: false,
        },
      });

      // Gerar token customizado
      const customToken = await this.firebaseAdmin.auth().createCustomToken(firebaseUser.uid);

      return {
        user: {
          user_id: user.user_id,
          user_name: user.user_name,
          user_email: user.user_email,
          admin: user.admin,
        },
        customToken,
        firebase_uid: firebaseUser.uid,
      };
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('Email já existe no Firebase');
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { user_email } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { user_email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const customToken = await this.firebaseAdmin.auth().createCustomToken(user.firebase_uid);

    return {
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
        admin: user.admin,
      },
      customToken,
    };
  }

  async validateUser(firebase_uid: string) {
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}