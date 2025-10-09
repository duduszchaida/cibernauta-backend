import { IsString, IsNotEmpty, IsInt, Min, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLevelDto {
  @IsString()
  @IsNotEmpty()
  level_title: string;

  @IsInt()
  @Min(1)
  position: number;
}

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  game_title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(0)
  difficulty: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLevelDto)
  levels: CreateLevelDto[];
}
