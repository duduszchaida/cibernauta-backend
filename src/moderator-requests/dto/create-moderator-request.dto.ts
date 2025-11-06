import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateModeratorRequestDto {
  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'Reason must be at most 500 characters long',
  })
  reason?: string;
}
