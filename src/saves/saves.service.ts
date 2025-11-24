import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveGameDto } from './dto/save-game.dto';
import { UpdateHighscoreDto } from './dto/update-highscore.dto';

@Injectable()
export class SavesService {
  constructor(private prisma: PrismaService) {}

  async getSave(userId: number, gameId: number) {
    let save = await this.prisma.save.findUnique({
      where: {
        user_id_game_id: {
          user_id: userId,
          game_id: gameId,
        },
      },
      include: {
        highscores: {
          include: {
            game: true,
          },
        },
      },
    });

    if (!save) {
      save = await this.prisma.save.create({
        data: {
          user_id: userId,
          game_id: gameId,
        },
        include: {
          highscores: {
            include: {
              game: true,
            },
          },
        },
      });
    }

    return save;
  }

  async saveGame(userId: number, saveGameDto: SaveGameDto) {
    const { game_id, save_data } = saveGameDto;

    let save = await this.prisma.save.findUnique({
      where: {
        user_id_game_id: {
          user_id: userId,
          game_id: game_id,
        },
      },
    });

    if (!save) {
      save = await this.prisma.save.create({
        data: {
          user_id: userId,
          game_id: game_id,
          save_data: save_data,
        },
      });
    } else {
      save = await this.prisma.save.update({
        where: { save_id: save.save_id },
        data: { save_data: save_data },
      });
    }

    return save;
  }

  async getHighscore(userId: number, gameId: number) {
    const save = await this.getSave(userId, gameId);

    const highscore = await this.prisma.highscore.findFirst({
      where: {
        save_id: save.save_id,
        game_id: gameId,
      },
    });

    if (!highscore) {
      return {
        score: 0,
        created_at: new Date(),
      };
    }

    return highscore;
  }

  async updateHighscore(userId: number, updateHighscoreDto: UpdateHighscoreDto) {
    const { game_id, score } = updateHighscoreDto;

    const save = await this.getSave(userId, game_id);

    let highscore = await this.prisma.highscore.findFirst({
      where: {
        save_id: save.save_id,
        game_id: game_id,
      },
    });

    if (!highscore) {
      highscore = await this.prisma.highscore.create({
        data: {
          save_id: save.save_id,
          game_id: game_id,
          score: score,
        },
      });
    } else if (score > highscore.score) {
      highscore = await this.prisma.highscore.update({
        where: { highscore_id: highscore.highscore_id },
        data: { score: score },
      });
    }

    return highscore;
  }

  async getAllHighscores(gameId: number, limit: number = 10) {
    const highscores = await this.prisma.highscore.findMany({
      where: { game_id: gameId },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        save: {
          include: {
            user: {
              select: {
                username: true,
                full_name: true,
              },
            },
          },
        },
      },
    });

    return highscores;
  }
}
