import { IsString, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Docker Swarm com NFS' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Repositório com configuração de cluster Docker Swarm' })
  @IsString()
  description: string;

  @ApiProperty({ example: '/portfolio-swarm.png', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 'containerization' })
  @IsString()
  category: string;

  @ApiProperty({ example: ['Docker', 'Docker Swarm', 'NFS'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  technologies: string[];

  @ApiProperty({ example: 'https://demo.example.com', required: false })
  @IsOptional()
  @IsString()
  demoUrl?: string;

  @ApiProperty({ example: 'https://github.com/user/repo', required: false })
  @IsOptional()
  @IsString()
  githubUrl?: string;

  @ApiProperty({ example: '2025-12-01', required: false })
  @IsOptional()
  @IsString()
  projectDate?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateProjectDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  demoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  githubUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
