import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { CreatePendingGameDto } from './dto/create-pending-game.dto';
import { ApproveGameDto } from './dto/approve-game.dto';
import { FirebaseAuthGuard } from '../firebase/firebase.guard';
import { AdminGuard } from '../firebase/admin.guard';
import { ModeratorGuard } from '../firebase/moderator.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Post('pending')
  @UseGuards(FirebaseAuthGuard, ModeratorGuard)
  async createPending(@Request() req, @Body() createPendingGameDto: CreatePendingGameDto) {
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid: req.user.uid },
    });
    return this.gamesService.createPendingGame(createPendingGameDto, user!.role, user!.user_id);
  }

  @Get('pending/my')
  @UseGuards(FirebaseAuthGuard, ModeratorGuard)
  async getMyPending(@Request() req) {
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid: req.user.uid },
    });
    return this.gamesService.getMyPendingGames(user!.user_id);
  }

  @Get('all/my')
  @UseGuards(FirebaseAuthGuard, ModeratorGuard)
  async getMyAll(@Request() req) {
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid: req.user.uid },
    });
    return this.gamesService.getMyAllGames(user!.user_id);
  }
  
  @Get('pending')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  getPending() {
    return this.gamesService.getPendingGames();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(+id);
  }

  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(+id, updateGameDto);
  }

  @UseGuards(FirebaseAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamesService.remove(+id);
  }

  @Patch('pending/:id')
  @UseGuards(FirebaseAuthGuard, ModeratorGuard)
  async updatePending(@Request() req, @Param('id') id: string, @Body() updateDto: Partial<CreatePendingGameDto>) {
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid: req.user.uid },
    });
    return this.gamesService.updatePendingGame(+id, updateDto, user!.user_id, user!.role);
  }

  @Patch('pending/:id/approve')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  approvePending(@Param('id') id: string, @Body() approveDto: ApproveGameDto) {
    return this.gamesService.approvePendingGame(+id, approveDto);
  }

  @Delete('pending/:id')
  @UseGuards(FirebaseAuthGuard, ModeratorGuard)
  async deletePending(@Request() req, @Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid: req.user.uid },
    });
    return this.gamesService.deletePendingGame(+id, user!.user_id, user!.role);
  }
}