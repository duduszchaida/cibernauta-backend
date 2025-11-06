import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject('FIREBASE_ADMIN') private firebaseAdmin: typeof admin,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        user_id: true,
        username: true,
        full_name: true,
        user_email: true,
        admin: true,
        role: true,
        created_at: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        username: true,
        full_name: true,
        user_email: true,
        admin: true,
        role: true,
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
        username: true,
        full_name: true,
        user_email: true,
        admin: true,
        role: true,
        created_at: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const dataToUpdate = { ...updateUserDto };
    if (updateUserDto.role) {
      dataToUpdate.admin = updateUserDto.role === 'ADMIN';
    }

    return this.prisma.user.update({
      where: { user_id: id },
      data: dataToUpdate,
      select: {
        user_id: true,
        username: true,
        full_name: true,
        user_email: true,
        admin: true,
        role: true,
        created_at: true,
      },
    });
  }

  async updateProfile(firebase_uid: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { firebase_uid },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.prisma.user.update({
      where: { firebase_uid },
      data: updateProfileDto,
      select: {
        user_id: true,
        username: true,
        full_name: true,
        user_email: true,
        admin: true,
        role: true,
        created_at: true,
      },
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    try {

      await this.prisma.user.delete({
        where: { user_id: id },
      });

      
      await this.firebaseAdmin.auth().deleteUser(user.firebase_uid);

      return { message: 'Usuário deletado com sucesso' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new BadRequestException('Erro ao deletar usuário');
    }
  }
}