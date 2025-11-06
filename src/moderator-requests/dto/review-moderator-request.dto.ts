import { IsEnum } from 'class-validator';
import { RequestStatus } from '@prisma/client';

export class ReviewModeratorRequestDto {
  @IsEnum(RequestStatus, {
    message: 'Status must be either APPROVED or REJECTED',
  })
  status: RequestStatus;
}
