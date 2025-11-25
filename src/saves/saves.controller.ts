import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SavesService } from './saves.service';
import { SaveGameDto } from './dto/save-game.dto';
import { UpdateHighscoreDto } from './dto/update-highscore.dto';
import { FirebaseAuthGuard } from '../firebase/firebase.guard';

@Controller('saves')
@UseGuards(FirebaseAuthGuard)
export class SavesController {
  constructor(private readonly savesService: SavesService) {}

  @Get('/:gameId')
  async getSave(@Request() req, @Param('gameId') gameId: string) {
    const userId = req.user.user_id;
    return this.savesService.getSave(userId, parseInt(gameId));
  }

  @Post()
  async saveGame(@Request() req, @Body() saveGameDto: SaveGameDto) {
    const userId = req.user.user_id;
    return this.savesService.saveGame(userId, saveGameDto);
  }

  @Get('highscore/:gameId')
  async getHighscore(@Request() req, @Param('gameId') gameId: string) {
    const userId = req.user.user_id;
    return this.savesService.getHighscore(userId, parseInt(gameId));
  }

  @Post('highscore')
  async updateHighscore(
    @Request() req,
    @Body() updateHighscoreDto: UpdateHighscoreDto,
  ) {
    const userId = req.user.user_id;
    return this.savesService.updateHighscore(userId, updateHighscoreDto);
  }

  @Get('leaderboard/:gameId')
  async getLeaderboard(
    @Param('gameId') gameId: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.savesService.getAllHighscores(
      parseInt(gameId),
      parseInt(limit),
    );
  }
}
