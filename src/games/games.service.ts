import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { CreatePendingGameDto } from './dto/create-pending-game.dto';
import { ApproveGameDto } from './dto/approve-game.dto';
import { ChangeType, ChangeStatus } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async create(createGameDto: CreateGameDto) {
    const { game_title, description, difficulty, image_url, game_url, enabled } = createGameDto;

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
        enabled,
      },
    });

    return game;
  }

  async findAll() {
    return this.prisma.game.findMany({
      orderBy: {
        game_id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const game = await this.prisma.game.findUnique({
      where: { game_id: id },
    });

    if (!game) {
      throw new NotFoundException('Jogo não encontrado');
    }

    return game;
  }

  async update(id: number, updateGameDto: UpdateGameDto) {
    await this.findOne(id);

    const game = await this.prisma.game.update({
      where: { game_id: id },
      data: updateGameDto,
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

  async createPendingGame(createPendingGameDto: CreatePendingGameDto, userRole: string, userId: number) {
    const { game_title, description, difficulty, image_url, game_url, enabled, change_type, game_id } = createPendingGameDto;

    if (userRole === 'ADMIN') {
      if (change_type === 'CREATE') {
        return this.create({ game_title, description, difficulty, image_url, game_url, enabled });
      } else {
        return this.update(game_id!, { game_title, description, difficulty, image_url, game_url, enabled });
      }
    }

    const pendingGame = await this.prisma.gamePending.create({
      data: {
        game_id,
        change_type,
        game_title,
        description,
        difficulty,
        image_url,
        game_url,
        enabled,
        status: 'PENDING',
        created_by_user_id: userId,
      },
    });

    return pendingGame;
  }

  async getPendingGames() {
    return this.prisma.gamePending.findMany({
      where: { status: 'PENDING' },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getMyPendingGames(userId: number) {
    return this.prisma.gamePending.findMany({
      where: {
        created_by_user_id: userId,
        status: 'PENDING'
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async approvePendingGame(changeId: number, approveDto: ApproveGameDto) {
    const pendingChange = await this.prisma.gamePending.findUnique({
      where: { change_id: changeId },
    });

    if (!pendingChange) {
      throw new NotFoundException('Alteração pendente não encontrada');
    }

    if (pendingChange.status !== 'PENDING') {
      throw new ConflictException('Esta alteração já foi revisada');
    }

    await this.prisma.gamePending.update({
      where: { change_id: changeId },
      data: {
        status: approveDto.status,
        reviewed_at: new Date(),
      },
    });

    if (approveDto.status === 'APPROVED') {
      const { game_id, change_type, game_title, description, difficulty, image_url, game_url, enabled } = pendingChange;

      if (change_type === 'CREATE') {
        const game = await this.prisma.game.create({
          data: {
            game_title,
            description,
            difficulty,
            image_url,
            game_url,
            enabled,
          },
        });
        return { message: 'Jogo aprovado e criado com sucesso', game };
      } else if (change_type === 'UPDATE' && game_id) {
        const game = await this.prisma.game.update({
          where: { game_id },
          data: {
            game_title,
            description,
            difficulty,
            image_url,
            game_url,
            enabled,
          },
        });
        return { message: 'Alteração aprovada e aplicada com sucesso', game };
      }
    }

    return { message: approveDto.status === 'APPROVED' ? 'Aprovado com sucesso' : 'Rejeitado com sucesso' };
  }

  async updatePendingGame(changeId: number, updateData: Partial<CreatePendingGameDto>, userId: number, userRole: string) {
    const pendingChange = await this.prisma.gamePending.findUnique({
      where: { change_id: changeId },
    });

    if (!pendingChange) {
      throw new NotFoundException('Alteração pendente não encontrada');
    }

    if (pendingChange.status !== 'PENDING') {
      throw new ConflictException('Não é possível editar uma alteração que já foi revisada');
    }

    if (userRole !== 'ADMIN' && pendingChange.created_by_user_id !== userId) {
      throw new ConflictException('Você não tem permissão para editar esta solicitação');
    }

    const updated = await this.prisma.gamePending.update({
      where: { change_id: changeId },
      data: updateData,
    });

    return updated;
  }

  async deletePendingGame(changeId: number, userId: number, userRole: string) {
    const pendingChange = await this.prisma.gamePending.findUnique({
      where: { change_id: changeId },
    });

    if (!pendingChange) {
      throw new NotFoundException('Alteração pendente não encontrada');
    }

    if (pendingChange.status !== 'PENDING') {
      throw new ConflictException('Não é possível excluir uma alteração que já foi revisada');
    }

    if (userRole !== 'ADMIN' && pendingChange.created_by_user_id !== userId) {
      throw new ConflictException('Você não tem permissão para excluir esta solicitação');
    }

    await this.prisma.gamePending.delete({
      where: { change_id: changeId },
    });

    return { message: 'Alteração pendente removida com sucesso' };
  }
}