import { describe, it, expect, beforeEach } from 'vitest';
import { AuthController } from './auth.controller';
import { UnauthorizedException } from '@nestjs/common';

class MockAuthService {
  async login(loginDto: any) {
    if (loginDto.username === 'admin' && loginDto.password === 'password') {
      return {
        access_token: 'mock-token',
        user: { id: '1', username: 'admin', role: 'admin' },
      };
    }
    throw new UnauthorizedException('Credenciais inválidas');
  }

  async createUser(createUserDto: any) {
    if (createUserDto.username === 'existing') {
      throw new UnauthorizedException('Usuário já existe');
    }
    return {
      id: '1',
      username: createUserDto.username,
      role: createUserDto.role ?? 'admin',
    };
  }

  async validateToken(token: string) {
    if (token === 'valid-token') {
      return { id: '1', username: 'admin', role: 'admin' };
    }
    throw new UnauthorizedException('Token inválido');
  }
}

describe('AuthController', () => {
  let controller: AuthController;
  let service: MockAuthService;

  beforeEach(() => {
    service = new MockAuthService();
    controller = new AuthController(service as any);
  });

  describe('login', () => {
    it('should return access token and user on valid credentials', async () => {
      const loginDto = { username: 'admin', password: 'password' };
      const result = await controller.login(loginDto);

      expect(result).toEqual({
        access_token: 'mock-token',
        user: { id: '1', username: 'admin', role: 'admin' },
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto = { username: 'admin', password: 'wrong' };
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const createUserDto = { username: 'newuser', password: 'password', role: 'admin' };
      const result = await controller.register(createUserDto);

      expect(result).toEqual({
        id: '1',
        username: 'newuser',
        role: 'admin',
      });
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      const createUserDto = { username: 'existing', password: 'password', role: 'admin' };
      await expect(controller.register(createUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validate', () => {
    it('should return user info on valid token', async () => {
      const result = await controller.validate('Bearer valid-token');

      expect(result).toEqual({
        id: '1',
        username: 'admin',
        role: 'admin',
      });
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      await expect(controller.validate('Bearer invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      await expect(controller.validate('')).rejects.toThrow(UnauthorizedException);
    });
  });
});
