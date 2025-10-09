import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        user_id: true,
        user_name: true,
        user_email: true,
        admin: true,
        created_at: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        user_name: true,
        user_email: true,
        admin: true,
        created_at: true,
      },
    });
  }

  async findByFirebaseUid(firebase_uid: string) {
    return this.prisma.user.findUnique({
      where: { firebase_uid },
      select: {
        user_id: true,
        firebase_uid: true,
        user_name: true,
        user_email: true,
        admin: true,
        created_at: true,
      },
    });
  }
}