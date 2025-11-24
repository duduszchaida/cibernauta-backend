import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { CreatePendingGameDto } from './dto/create-pending-game.dto';
import { ApproveGameDto } from './dto/approve-game.dto';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async create(createGameDto: CreateGameDto) {
    const { game_title, description, difficulty, image_url, game_url, game_type, enabled, controls } = createGameDto;

    const existingGame = await this.prisma.game.findUnique({
      where: { game_title },
    });

    if (existingGame) {
      throw new ConflictException('Jogo com este título já existe');
    }

    const game = await this.prisma.game.create({
      data: {
        game_title,
        description,
        difficulty,
        image_url,
        game_url,
        game_type: game_type || 'external',
        enabled,
        controls: controls ? {
          create: controls.map((control, index) => ({
            key_image: control.key_image,
            description: control.description,
            order: index,
          })),
        } : undefined,
      },
      include: {
        controls: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return game;
  }

  async findAll() {
    return this.prisma.game.findMany({
      orderBy: {
        game_id: 'desc',
      },
      include: {
        controls: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findOne(id: number) {
    const game = await this.prisma.game.findUnique({
      where: { game_id: id },
      include: {
        controls: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Jogo não encontrado');
    }

    return game;
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    await this.findOne(id);

    const { controls, ...gameData } = updateGameDto as any;

    // Se controls foi enviado, deletar os antigos e criar novos
    if (controls !== undefined) {
      await this.prisma.gameControl.deleteMany({
        where: { game_id: id },
      });
    }

    const game = await this.prisma.game.update({
      where: { game_id: id },
      data: {
        ...gameData,
        controls: controls ? {
          create: controls.map((control: any, index: number) => ({
            key_image: control.key_image,
            description: control.description,
            order: index,
          })),
        } : undefined,
      },
      include: {
        controls: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return game;
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.game.delete({
      where: { game_id: id },
    });

    return { message: 'Jogo removido com sucesso' };
  }
  
  async getMyAllGames(userId: number) {
    return this.prisma.gameRequest.findMany({
      where: {
        created_by_user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async createPendingGame(createPendingGameDto: CreatePendingGameDto, userRole: string, userId: number) {
    const { game_title, description, difficulty, image_url, game_url, game_type, enabled, change_type, game_id, controls } = createPendingGameDto;

    if (userRole === 'ADMIN') {
      if (change_type === 'CREATE') {
        return this.create({ game_title, description, difficulty, image_url, game_url, game_type, enabled, controls });
      } else {
        return this.update(game_id!, { game_title, description, difficulty, image_url, game_url, game_type, enabled, controls });
      }
    }

    const gameRequest = await this.prisma.gameRequest.create({
      data: {
        game_id,
        change_type,
        game_title,
        description,
        difficulty,
        image_url,
        game_url,
        game_type: game_type || 'external',
        enabled,
        controls: controls ? JSON.parse(JSON.stringify(controls)) : null,
        status: 'PENDING',
        created_by_user_id: userId,
      },
    });

    return gameRequest;
  }

  async getPendingGames() {
    return this.prisma.gameRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        createdBy: {
          select: {
            user_id: true,
            username: true,
            user_email: true,
          },
        },
      },
    });
  }

  async getMyPendingGames(userId: number) {
    return this.prisma.gameRequest.findMany({
      where: {
        created_by_user_id: userId,
        status: 'PENDING'
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async approvePendingGame(requestId: number, approveDto: ApproveGameDto) {
    const gameRequest = await this.prisma.gameRequest.findUnique({
      where: { request_id: requestId },
    });

    if (!gameRequest) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (gameRequest.status !== 'PENDING') {
      throw new ConflictException('Esta solicitação já foi revisada');
    }

    await this.prisma.gameRequest.update({
      where: { request_id: requestId },
      data: {
        status: approveDto.status,
        reviewed_at: new Date(),
      },
    });

    if (approveDto.status === 'APPROVED') {
      const { game_id, change_type, game_title, description, difficulty, image_url, game_url, game_type, enabled, controls } = gameRequest;

      if (change_type === 'CREATE') {
        const game = await this.prisma.game.create({
          data: {
            game_title,
            description,
            difficulty,
            image_url,
            game_url,
            game_type: game_type || 'external',
            enabled,
            controls: controls ? {
              create: (controls as any[]).map((control, index) => ({
                key_image: control.key_image,
                description: control.description,
                order: index,
              })),
            } : undefined,
          },
          include: {
            controls: {
              orderBy: { order: 'asc' },
            },
          },
        });
        return { message: 'Jogo aprovado e criado com sucesso', game };
      } else if (change_type === 'UPDATE' && game_id) {
        // Se controls foi enviado, deletar os antigos e criar novos
        if (controls !== null && controls !== undefined) {
          await this.prisma.gameControl.deleteMany({
            where: { game_id },
          });
        }

        const game = await this.prisma.game.update({
          where: { game_id },
          data: {
            game_title,
            description,
            difficulty,
            image_url,
            game_url,
            game_type: game_type || 'external',
            enabled,
            controls: controls ? {
              create: (controls as any[]).map((control, index) => ({
                key_image: control.key_image,
                description: control.description,
                order: index,
              })),
            } : undefined,
          },
          include: {
            controls: {
              orderBy: { order: 'asc' },
            },
          },
        });
        return { message: 'Alteração aprovada e aplicada com sucesso', game };
      }
    }

    return { message: approveDto.status === 'APPROVED' ? 'Aprovado com sucesso' : 'Rejeitado com sucesso' };
  }

  async updatePendingGame(requestId: number, updateData: Partial<CreatePendingGameDto>, userId: number, userRole: string) {
    const gameRequest = await this.prisma.gameRequest.findUnique({
      where: { request_id: requestId },
    });

    if (!gameRequest) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (gameRequest.status !== 'PENDING') {
      throw new ConflictException('Não é possível editar uma solicitação que já foi revisada');
    }

    if (userRole !== 'ADMIN' && gameRequest.created_by_user_id !== userId) {
      throw new ConflictException('Você não tem permissão para editar esta solicitação');
    }

    // Serialize controls if present
    const { controls, ...otherData } = updateData;
    const dataToUpdate = {
      ...otherData,
      ...(controls !== undefined && { controls: controls ? JSON.parse(JSON.stringify(controls)) : null }),
    };

    const updated = await this.prisma.gameRequest.update({
      where: { request_id: requestId },
      data: dataToUpdate,
    });

    return updated;
  }

  async deletePendingGame(requestId: number, userId: number, userRole: string) {
    const gameRequest = await this.prisma.gameRequest.findUnique({
      where: { request_id: requestId },
    });

    if (!gameRequest) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (gameRequest.status !== 'PENDING') {
      throw new ConflictException('Não é possível excluir uma solicitação que já foi revisada');
    }

    if (userRole !== 'ADMIN' && gameRequest.created_by_user_id !== userId) {
      throw new ConflictException('Você não tem permissão para excluir esta solicitação');
    }

    await this.prisma.gameRequest.delete({
      where: { request_id: requestId },
    });

    return { message: 'Solicitação removida com sucesso' };
  }
}