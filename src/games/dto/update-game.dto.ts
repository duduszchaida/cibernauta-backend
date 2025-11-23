import { IsString, IsInt, Min, Max, IsOptional, IsBoolean } from 'class-validator';

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
}