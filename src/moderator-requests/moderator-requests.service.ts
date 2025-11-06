import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModeratorRequestDto } from './dto/create-moderator-request.dto';
import { ReviewModeratorRequestDto } from './dto/review-moderator-request.dto';
import { RequestStatus, UserRole } from '@prisma/client';

@Injectable()
export class ModeratorRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createDto: CreateModeratorRequestDto) {
    
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.role === UserRole.MODERATOR || user.role === UserRole.ADMIN) {
      throw new ConflictException(
        'Você já possui permissões de moderador ou administrador',
      );
    }

    
    const existingRequest = await this.prisma.moderatorRequest.findFirst({
      where: {
        user_id: userId,
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        'Você já possui uma solicitação pendente. Aguarde a análise do administrador.',
      );
    }

    const request = await this.prisma.moderatorRequest.create({
      data: {
        user_id: userId,
        reason: createDto.reason,
        status: RequestStatus.PENDING,
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            full_name: true,
            user_email: true,
            role: true,
          },
        },
      },
    });

    return request;
  }

  async findAll() {
    return this.prisma.moderatorRequest.findMany({
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            full_name: true,
            user_email: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            user_id: true,
            username: true,
            full_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findPending() {
    return this.prisma.moderatorRequest.findMany({
      where: {
        status: RequestStatus.PENDING,
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            full_name: true,
            user_email: true,
            role: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  async findMyRequest(userId: number) {
    const request = await this.prisma.moderatorRequest.findFirst({
      where: {
        user_id: userId,
      },
      include: {
        reviewer: {
          select: {
            user_id: true,
            username: true,
            full_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return request;
  }

  async review(
    requestId: number,
    reviewDto: ReviewModeratorRequestDto,
    reviewerId: number,
  ) {

    if (reviewDto.status === RequestStatus.PENDING) {
      throw new BadRequestException(
        'Status deve ser APPROVED ou REJECTED',
      );
    }

    
    const request = await this.prisma.moderatorRequest.findUnique({
      where: { request_id: requestId },
      include: {
        user: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new ConflictException('Esta solicitação já foi revisada');
    }

    const updatedRequest = await this.prisma.moderatorRequest.update({
      where: { request_id: requestId },
      data: {
        status: reviewDto.status,
        reviewed_at: new Date(),
        reviewed_by: reviewerId,
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            full_name: true,
            user_email: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            user_id: true,
            username: true,
            full_name: true,
          },
        },
      },
    });

    if (reviewDto.status === RequestStatus.APPROVED) {
      await this.prisma.user.update({
        where: { user_id: request.user_id },
        data: {
          role: UserRole.MODERATOR,
        },
      });
    }

    return updatedRequest;
  }

  async delete(requestId: number, userId: number) {
    
    const request = await this.prisma.moderatorRequest.findUnique({
      where: { request_id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (request.user_id !== userId) {
      throw new ConflictException(
        'Você não tem permissão para deletar esta solicitação',
      );
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new ConflictException(
        'Apenas solicitações pendentes podem ser deletadas',
      );
    }

    await this.prisma.moderatorRequest.delete({
      where: { request_id: requestId },
    });

    return { message: 'Solicitação deletada com sucesso' };
  }
}
