import { IsString, IsOptional } from 'class-validator';

export class SaveGameDto {
  @IsString()
  @IsOptional()
  save_data?: string;
}
