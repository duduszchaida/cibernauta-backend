import { Module } from '@nestjs/common';
import { ModeratorRequestsService } from './moderator-requests.service';
import { ModeratorRequestsController } from './moderator-requests.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModeratorRequestsController],
  providers: [ModeratorRequestsService],
})
export class ModeratorRequestsModule {}
