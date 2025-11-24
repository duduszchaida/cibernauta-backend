import { IsString, IsInt, Min, Max, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { GameControlDto } from './create-game.dto';

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  game_title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  difficulty?: number;

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