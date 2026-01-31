import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, CreateUserDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Get('validate')
  async validate(@Headers('authorization') authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authorization.replace('Bearer ', '');
    return this.authService.validateToken(token);
  }
}
