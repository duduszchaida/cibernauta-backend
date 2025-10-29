import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async create(createGameDto: CreateGameDto) {
    const { game_title, description, difficulty, image_url, levels } = createGameDto;

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
        levels: {
          create: levels.map((level) => ({
            level_title: level.level_title,
          })),
        },
      },
      include: {
        levels: true,
      },
    });

    return game;
  }

  async findAll() {
    return this.prisma.game.findMany({
      include: {
        levels: {
          orderBy: {
            level_id: 'asc',
          },
        },
      },
      orderBy: {
        game_id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const game = await this.prisma.game.findUnique({
      where: { game_id: id },
      include: {
        levels: {
          orderBy: {
            level_id: 'asc',
          },
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

    const { levels, ...gameData } = updateGameDto as any;

    if (Object.keys(gameData).length > 0) {
      await this.prisma.game.update({
        where: { game_id: id },
        data: gameData,
      });
    }

    if (levels && Array.isArray(levels) && levels.length > 0) {
      
      await this.prisma.level.deleteMany({
        where: { game_id: id },
      });

      
      await this.prisma.level.createMany({
        data: levels.map((level: any) => ({
          level_title: level.level_title,
          game_id: id,
        })),
      });
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

   
    await this.prisma.level.deleteMany({
      where: { game_id: id },
    });

    await this.prisma.game.delete({
      where: { game_id: id },
    });

    return { message: 'Jogo removido com sucesso' };
  }
}