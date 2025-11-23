import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GameControlDto {
  @IsString()
  @IsNotEmpty()
  key_image: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateGameDto {
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
