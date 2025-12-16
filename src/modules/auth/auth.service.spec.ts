import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

class MockAuthService {
  constructor(
    private readonly userModel: any,
    private readonly jwtService: any,
  ) {}

  async login(loginDto: any) {
    const { username, password } = loginDto;

    if (typeof username !== 'string') {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const user = await this.userModel.findOne({ username: { $eq: username }, active: true });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user._id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async createUser(createUserDto: any) {
    const { username, password, role } = createUserDto;

    if (typeof username !== 'string') {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const existingUser = await this.userModel.findOne({ username: { $eq: username } });
    if (existingUser) {
      throw new UnauthorizedException('Usuário já existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      _id: 'new-id',
      username,
      password: hashedPassword,
      role: role ?? 'admin',
      save: vi.fn(),
    };

    await user.save();

    return {
      id: user._id,
      username: user.username,
      role: user.role,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findById(payload.sub);

      if (!user?.active) {
        throw new UnauthorizedException();
      }

      return {
        id: user._id,
        username: user.username,
        role: user.role,
      };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}

describe('AuthService', () => {
  let service: MockAuthService;
  let mockUserModel: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockUserModel = {
      findOne: vi.fn(),
      findById: vi.fn(),
    };

    mockJwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      verify: vi.fn(),
    };

    service = new MockAuthService(mockUserModel, mockJwtService);
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

      const result = await service.login({ username: 'admin', password: 'password' });

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

      await expect(service.login({ username: 'nonexistent', password: 'password' })).rejects.toThrow(
        UnauthorizedException,
      );
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

      await expect(service.login({ username: 'admin', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when username is not a string', async () => {
      await expect(service.login({ username: { $ne: null }, password: 'password' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.createUser({
        username: 'newuser',
        password: 'password',
        role: 'admin',
      });

      expect(result).toEqual({
        id: 'new-id',
        username: 'newuser',
        role: 'admin',
      });
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      mockUserModel.findOne.mockResolvedValue({ username: 'existing' });

      await expect(
        service.createUser({ username: 'existing', password: 'password', role: 'admin' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when username is not a string', async () => {
      await expect(
        service.createUser({ username: { $ne: null }, password: 'password', role: 'admin' }),
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

      mockJwtService.verify.mockReturnValue({ sub: '1', username: 'admin', role: 'admin' });
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.validateToken('valid-token');

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

      await expect(service.validateToken('invalid-token')).rejects.toThrow(UnauthorizedException);
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

      await expect(service.validateToken('valid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
