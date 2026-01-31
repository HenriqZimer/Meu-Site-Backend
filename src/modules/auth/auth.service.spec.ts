import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserModel: any;
  let mockJwtService: any;

  beforeEach(() => {
    const saveMock = vi.fn().mockResolvedValue({
      _id: 'new-id',
      username: 'test',
      role: 'admin',
    });

    // Create constructor mock
    mockUserModel = vi.fn().mockImplementation((data) => ({
      ...data,
      _id: 'new-id',
      save: saveMock,
    }));

    // Add static methods
    mockUserModel.findOne = vi.fn();
    mockUserModel.findById = vi.fn();

    mockJwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      verify: vi.fn(),
    };

    // Manually instantiate AuthService with mocks
    authService = new AuthService(mockUserModel, mockJwtService);
  });

  describe('login', () => {
    it('should return access token and user on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      const mockUser = {
        _id: '1',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        active: true,
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await authService.login({ username: 'admin', password: 'password' });

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: { id: '1', username: 'admin', role: 'admin' },
      });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        username: { $eq: 'admin' },
        active: true,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        authService.login({ username: 'nonexistent', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      const mockUser = {
        _id: '1',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        active: true,
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(authService.login({ username: 'admin', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when username is not a string', async () => {
      await expect(
        authService.login({ username: { $ne: null } as any, password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await authService.createUser({
        username: 'newuser',
        password: 'password',
        role: 'admin',
      });

      expect(result).toEqual({
        id: 'new-id',
        username: 'newuser',
        role: 'admin',
      });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        username: { $eq: 'newuser' },
      });
    });

    it('should create user with default admin role', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await authService.createUser({
        username: 'newuser',
        password: 'password',
      });

      expect(result.role).toBe('admin');
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      mockUserModel.findOne.mockResolvedValue({ username: 'existing' });

      await expect(
        authService.createUser({ username: 'existing', password: 'password', role: 'admin' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when username is not a string', async () => {
      await expect(
        authService.createUser({
          username: { $ne: null } as any,
          password: 'password',
          role: 'admin',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('should return user info on valid token', async () => {
      const mockUser = {
        _id: '1',
        username: 'admin',
        role: 'admin',
        active: true,
      };

      // Configure mocks for this specific test
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockJwtService.verify.mockReturnValue({ sub: '1', username: 'admin', role: 'admin' });
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await authService.validateToken('valid-token');

      expect(result).toEqual({
        id: '1',
        username: 'admin',
        role: 'admin',
      });
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.validateToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is not active', async () => {
      const mockUser = {
        _id: '1',
        username: 'admin',
        role: 'admin',
        active: false,
      };

      mockJwtService.verify.mockReturnValue({ sub: '1', username: 'admin', role: 'admin' });
      mockUserModel.findById.mockResolvedValue(mockUser);

      await expect(authService.validateToken('valid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is null', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '1', username: 'admin', role: 'admin' });
      mockUserModel.findById.mockResolvedValue(null);

      await expect(authService.validateToken('valid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
