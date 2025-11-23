import { IsNumber } from 'class-validator';

export class UpdateHighscoreDto {
  @IsNumber()
  game_id: number;

  @IsNumber()
  score: number;
}
