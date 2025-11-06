import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'O nome de usuário de login deve ter no mínimo 3 caracteres' })
  @MaxLength(16, { message: 'O nome de usuário de login deve ter no máximo 16 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'O nome de usuário de login deve conter apenas letras, números e underscore'
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  user_email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}