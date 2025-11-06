import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ChangeType } from '@prisma/client';

export class CreatePendingGameDto {
  @IsOptional()
  @IsInt()
  game_id?: number;

  @IsEnum(ChangeType)
  change_type: ChangeType;

  @IsString()
  @IsNotEmpty()
  game_title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  @Max(3)
  difficulty: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  game_url?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
