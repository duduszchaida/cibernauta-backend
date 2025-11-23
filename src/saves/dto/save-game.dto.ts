import { IsString, IsOptional, IsNumber } from 'class-validator';

export class SaveGameDto {
  @IsNumber()
  game_id: number;

  @IsNumber()
  save_slot: number;

  @IsString()
  @IsOptional()
  save_data?: string;
}
