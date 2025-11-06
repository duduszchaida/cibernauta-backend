import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ModeratorRequestsService } from './moderator-requests.service';
import { CreateModeratorRequestDto } from './dto/create-moderator-request.dto';
import { ReviewModeratorRequestDto } from './dto/review-moderator-request.dto';
import { FirebaseAuthGuard } from '../firebase/firebase.guard';
import { AdminGuard } from '../firebase/admin.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('moderator-requests')
export class ModeratorRequestsController {
  constructor(
    private readonly moderatorRequestsService: ModeratorRequestsService,
    private readonly prisma: PrismaService,
  ) {}

 
  @Post()
  @UseGuards(FirebaseAuthGuard)
  async create(@Request() req, @Body() createDto: CreateModeratorRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid: req.user.uid },
    });
    return this.moderatorRequestsService.create(user!.user_id, createDto);
  }

 
  @Get()
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  findAll() {
    return this.moderatorRequestsService.findAll();
  }

  
  @Get('pending')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  findPending() {
    return this.moderatorRequestsService.findPending();
  }

  
  @Get('my')
  @UseGuards(FirebaseAuthGuard)
  async findMyRequest(@Request() req) {
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid: req.user.uid },
    });
    return this.moderatorRequestsService.findMyRequest(user!.user_id);
  }

  @Patch(':id/review')
  @UseGuards(FirebaseAuthGuard, AdminGuard)
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewDto: ReviewModeratorRequestDto,
    @Request() req,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid: req.user.uid },
    });
    return this.moderatorRequestsService.review(id, reviewDto, user!.user_id);
  }

  
  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid: req.user.uid },
    });
    return this.moderatorRequestsService.delete(id, user!.user_id);
  }
}
