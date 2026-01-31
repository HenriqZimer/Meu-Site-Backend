import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser um texto' })
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  name: string;

  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(100, { message: 'O email deve ter no máximo 100 caracteres' })
  email: string;

  @IsNotEmpty({ message: 'O assunto é obrigatório' })
  @IsString({ message: 'O assunto deve ser um texto' })
  @MinLength(3, { message: 'O assunto deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'O assunto deve ter no máximo 200 caracteres' })
  subject: string;

  @IsNotEmpty({ message: 'A mensagem é obrigatória' })
  @IsString({ message: 'A mensagem deve ser um texto' })
  @MinLength(10, { message: 'A mensagem deve ter pelo menos 10 caracteres' })
  @MaxLength(1000, { message: 'A mensagem deve ter no máximo 1000 caracteres' })
  message: string;
}
