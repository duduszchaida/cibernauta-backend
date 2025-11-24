import { Injectable, ConflictException, UnauthorizedException, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    @Inject('FIREBASE_ADMIN') private firebaseAdmin: typeof admin,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, full_name, user_email, password } = registerDto;


    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { user_email },
          { username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.user_email === user_email) {
        throw new ConflictException('Email já está em uso');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Nome de usuário de login já está em uso');
      }
    }

    try {

      const firebaseUser = await this.firebaseAdmin.auth().createUser({
        email: user_email,
        password: password,
        displayName: full_name,
        emailVerified: false,
      });

      const user = await this.prisma.user.create({
        data: {
          firebase_uid: firebaseUser.uid,
          username,
          full_name,
          user_email,
          admin: false,
          role: 'USER',
        },
      });

      
      await this.sendVerificationEmail(user_email, password);

      return {
        user: {
          user_id: user.user_id,
          username: user.username,
          full_name: user.full_name,
          user_email: user.user_email,
          admin: user.admin,
          role: user.role,
          emailVerified: false,
        },
        message: 'Conta criada! Verifique seu email para ativar sua conta.',
      };
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('Email já existe no Firebase');
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { identifier } = loginDto;


    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { user_email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const firebaseUser = await this.firebaseAdmin.auth().getUser(user.firebase_uid);

    if (!firebaseUser.emailVerified) {
      throw new UnauthorizedException('Email não verificado. Verifique sua caixa de entrada.');
    }

    const customToken = await this.firebaseAdmin.auth().createCustomToken(user.firebase_uid);

    return {
      user: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        user_email: user.user_email,
        admin: user.admin,
        role: user.role,
        emailVerified: true,
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

  async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto) {
    const { user_email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { user_email },
    });

    if (!user) {
      return {
        message: 'Se o email existir, você receberá as instruções em breve',
      };
    }

    const firebaseUser = await this.firebaseAdmin.auth().getUser(user.firebase_uid);

    if (!firebaseUser.emailVerified) {
      throw new BadRequestException('Você precisa verificar seu email antes de redefinir a senha');
    }

    try {
      const apiKey = this.configService.get('FIREBASE_WEB_API_KEY');

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestType: 'PASSWORD_RESET',
            email: user_email,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Erro ao enviar email:', error);
        throw new BadRequestException('Erro ao enviar email de redefinição');
      }

      return {
        message: 'Email de redefinição enviado com sucesso',
      };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new BadRequestException('Erro ao enviar email de redefinição');
    }
  }

  async verifyResetToken(oobCode: string) {
    if (!oobCode) {
      throw new BadRequestException('Token não fornecido');
    }

    return {
      valid: true,
      message: 'Token recebido - prossiga com a redefinição de senha',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    try {
      const apiKey = this.configService.get('FIREBASE_WEB_API_KEY');

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oobCode: token,
            newPassword: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Error resetting password:', data);
        throw new BadRequestException('Token inválido ou expirado');
      }

      return {
        message: 'Senha redefinida com sucesso',
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new BadRequestException('Erro ao redefinir senha');
    }
  }

  async changePassword(firebase_uid: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { firebase_uid },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const apiKey = this.configService.get('FIREBASE_WEB_API_KEY');
      const verifyResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.user_email,
            password: currentPassword,
            returnSecureToken: true,
          }),
        }
      );

      if (!verifyResponse.ok) {
        throw new UnauthorizedException('Senha atual incorreta');
      }

      await this.firebaseAdmin.auth().updateUser(firebase_uid, {
        password: newPassword,
      });

      return {
        message: 'Senha alterada com sucesso',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Error changing password:', error);
      throw new BadRequestException('Erro ao alterar senha');
    }
  }

  async deleteAccount(firebase_uid: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { firebase_uid },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      await this.prisma.user.delete({
        where: { firebase_uid },
      });

      await this.firebaseAdmin.auth().deleteUser(firebase_uid);

      return {
        message: 'Conta deletada com sucesso',
      };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new BadRequestException('Erro ao deletar conta');
    }
  }

  async sendVerificationEmail(email: string, password: string) {
    try {
      const apiKey = this.configService.get('FIREBASE_WEB_API_KEY');

      
      const loginResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true,
          }),
        }
      );

      if (!loginResponse.ok) {
        const error = await loginResponse.json();
        console.error('Erro ao fazer login para enviar email:', error);
        throw new BadRequestException('Erro ao autenticar para enviar email');
      }

      const loginData = await loginResponse.json();
      const idToken = loginData.idToken;

     
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestType: 'VERIFY_EMAIL',
            idToken: idToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Erro ao enviar email:', error);
        throw new BadRequestException('Erro ao enviar email de verificação');
      }

      const data = await response.json();
      console.log('Email de verificação enviado com sucesso para:', email);

      return {
        message: 'Email de verificação enviado com sucesso',
      };
    } catch (error) {
      console.error('Erro ao enviar email de verificação:', error);
      throw new BadRequestException('Erro ao enviar email de verificação');
    }
  }

  async sendVerificationEmailWithToken(firebase_uid: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { firebase_uid },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const firebaseUser = await this.firebaseAdmin.auth().getUser(firebase_uid);

      if (firebaseUser.emailVerified) {
        throw new BadRequestException('Email já verificado');
      }

      
      const customToken = await this.firebaseAdmin.auth().createCustomToken(firebase_uid);

      const apiKey = this.configService.get('FIREBASE_WEB_API_KEY');

      
      const tokenResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: customToken,
            returnSecureToken: true,
          }),
        }
      );

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        console.error('Erro ao trocar custom token:', error);
        throw new BadRequestException('Erro ao autenticar usuário');
      }

      const tokenData = await tokenResponse.json();
      const idToken = tokenData.idToken;

    
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestType: 'VERIFY_EMAIL',
            idToken: idToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Erro ao enviar email:', error);
        throw new BadRequestException('Erro ao enviar email de verificação');
      }

      console.log('Email de verificação reenviado com sucesso para:', user.user_email);

      return {
        message: 'Email de verificação enviado com sucesso',
      };
    } catch (error) {
      console.error('Erro ao enviar email de verificação:', error);
      throw new BadRequestException('Erro ao enviar email de verificação');
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_email: email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.sendVerificationEmailWithToken(user.firebase_uid);
  }

  async checkEmailVerificationStatus(firebase_uid: string) {
    try {
      const firebaseUser = await this.firebaseAdmin.auth().getUser(firebase_uid);

      if (firebaseUser.emailVerified) {
        const user = await this.prisma.user.findUnique({
          where: { firebase_uid },
        });

        return {
          emailVerified: true,
          email: firebaseUser.email,
          message: 'Email verificado com sucesso',
        };
      }

      return {
        emailVerified: false,
        email: firebaseUser.email,
        message: 'Email ainda não verificado',
      };
    } catch (error) {
      console.error('Erro ao verificar status do email:', error);
      throw new BadRequestException('Erro ao verificar status do email');
    }
  }
}
