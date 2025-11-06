import { IsEnum } from 'class-validator';
import { ChangeStatus } from '@prisma/client';

export class ApproveGameDto {
  @IsEnum(ChangeStatus)
  status: ChangeStatus;
}
