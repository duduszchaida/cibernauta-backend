import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModeratorGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { firebase_uid: user.uid },
    });

    if (!dbUser) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    if (dbUser.role === 'MODERATOR' || dbUser.role === 'ADMIN') {
      return true;
    }

    throw new ForbiddenException('Acesso negado. Apenas moderadores e administradores');
  }
}
