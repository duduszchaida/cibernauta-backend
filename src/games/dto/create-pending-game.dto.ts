import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ChangeType } from '@prisma/client';
import { Type } from 'class-transformer';
import { GameControlDto } from './create-game.dto';

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
  @IsString()
  game_type?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GameControlDto)
  controls?: GameControlDto[];
}
