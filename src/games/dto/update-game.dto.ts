import { IsString, IsInt, Min, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLevelDto } from './create-game.dto';

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  game_title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  difficulty?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLevelDto)
  levels?: CreateLevelDto[];
}