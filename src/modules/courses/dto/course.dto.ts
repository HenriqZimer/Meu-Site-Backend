import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Descomplicando Kubernetes' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'LINUXtips' })
  @IsString()
  platform: string;

  @ApiProperty({ example: 'Jeferson Fernando', required: false })
  @IsOptional()
  @IsString()
  instructor?: string;

  @ApiProperty({ example: '30h', required: false })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({ example: '/linux-tips.png', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 'https://credential.net/...', required: false })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ example: '2025-12', required: false })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateCourseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instructor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
