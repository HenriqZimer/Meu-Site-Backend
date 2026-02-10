import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Model } from 'mongoose';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockConfigService: any;
  let mockUserModel: any;

  beforeEach(() => {
    // Mock ConfigService
    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'JWT_SECRET') {
          return 'test-secret-key';
        }
        return undefined;
      }),
    } as unknown as ConfigService;

    // Mock UserModel
    mockUserModel = {
      findById: vi.fn(),
    } as unknown as Model<any>;

    strategy = new JwtStrategy(mockConfigService, mockUserModel);
  });

  describe('constructor', () => {
    it('should throw error when JWT_SECRET is not defined', () => {
      // Mock ConfigService to return undefined for JWT_SECRET
      const badConfigService = {
        get: vi.fn(() => undefined),
      } as unknown as ConfigService;

      expect(() => new JwtStrategy(badConfigService, mockUserModel)).toThrow(
        'JWT_SECRET não está definido nas variáveis de ambiente'
      );
    });

    it('should create strategy with valid JWT_SECRET', () => {
      expect(strategy).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });

  describe('validate', () => {
    it('should return user data when user is found and active', async () => {
      const mockUser = {
        _id: '123',
        username: 'testuser',
        role: 'admin',
        active: true,
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const payload = { sub: '123', username: 'testuser', role: 'admin' };
      const result = await strategy.validate(payload);

      expect(mockUserModel.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual({
        id: '123',
        username: 'testuser',
        role: 'admin',
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const payload = { sub: '999', username: 'unknown', role: 'user' };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate(payload)).rejects.toThrow('Usuário não encontrado');
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const mockUser = {
        _id: '123',
        username: 'testuser',
        role: 'user',
        active: false, // Inactive user
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const payload = { sub: '123', username: 'testuser', role: 'user' };

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      await expect(strategy.validate(payload)).rejects.toThrow('Usuário inativo');
    });

    it('should handle payload with different user roles', async () => {
      const mockUser = {
        _id: '456',
        username: 'moderator',
        role: 'moderator',
        active: true,
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const payload = { sub: '456', username: 'moderator', role: 'moderator' };
      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: '456',
        username: 'moderator',
        role: 'moderator',
      });
    });
  });
});
