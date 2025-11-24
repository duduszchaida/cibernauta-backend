import { IsString, IsOptional, IsInt } from 'class-validator';

export class SaveGameDto {
  @IsInt()
  game_id: number;

  @IsString()
  @IsOptional()
  save_data?: string;
}
