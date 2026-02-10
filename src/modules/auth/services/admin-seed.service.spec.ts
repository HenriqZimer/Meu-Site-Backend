import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminSeedService } from './admin-seed.service';
import type { ConfigService } from '@nestjs/config';
import type { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
vi.mock('bcrypt', () => ({
  hash: vi.fn(),
}));

describe('AdminSeedService', () => {
  let service: AdminSeedService;
  let mockUserModel: any;
  let mockConfigService: any;
  let mockLogger: any;

  beforeEach(() => {
    // Mock Logger
    mockLogger = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    // Mock ConfigService
    mockConfigService = {
      get: vi.fn((key: string, defaultValue?: string) => {
        if (key === 'ADMIN_USERNAME') return defaultValue || 'testadmin';
        if (key === 'ADMIN_PASSWORD') return defaultValue || 'testpass123';
        return defaultValue;
      }),
    } as unknown as ConfigService;

    // Mock UserModel
    const mockExec = vi.fn();
    mockUserModel = {
      findOne: vi.fn(() => ({ exec: mockExec })),
      save: vi.fn(),
    } as unknown as Model<any>;

    // Create service instance
    service = new AdminSeedService(mockUserModel, mockConfigService);
    // Replace logger with mock
    (service as any).logger = mockLogger;

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should call seedAdminUser on module initialization', async () => {
      const seedSpy = vi.spyOn(service, 'seedAdminUser').mockResolvedValue();

      await service.onModuleInit();

      expect(seedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('seedAdminUser', () => {
    it('should not create admin when one already exists', async () => {
      const mockExistingAdmin = {
        _id: '123',
        username: 'admin',
        role: 'admin',
      };

      const mockExec = vi.fn().mockResolvedValue(mockExistingAdmin);
      mockUserModel.findOne = vi.fn(() => ({ exec: mockExec }));

      await service.seedAdminUser();

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ role: 'admin' });
      expect(mockLogger.log).toHaveBeenCalledWith('✅ Admin user already exists');
    });

    it('should create admin user when none exists', async () => {
      // Configure mock to return custom credentials for this test
      mockConfigService.get = vi.fn((key: string, defaultValue?: string) => {
        if (key === 'ADMIN_USERNAME') return 'testadmin';
        if (key === 'ADMIN_PASSWORD') return 'testpass123';
        return defaultValue;
      });

      // No admin exists
      const mockExec = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      mockUserModel.findOne = vi.fn(() => ({ exec: mockExec }));

      // Mock bcrypt.hash
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

      // Mock user save
      const mockUser = {
        save: vi.fn().mockResolvedValue({
          _id: '456',
          username: 'testadmin',
          role: 'admin',
        }),
      };
      mockUserModel = Object.assign(vi.fn(() => mockUser), {
        findOne: vi.fn(() => ({ exec: mockExec })),
      });

      service = new AdminSeedService(mockUserModel, mockConfigService);
      (service as any).logger = mockLogger;

      await service.seedAdminUser();

      expect(bcrypt.hash).toHaveBeenCalledWith('testpass123', 10);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        '✅ Admin user created successfully: testadmin'
      );
    });

    it('should warn when using default credentials', async () => {
      // Configure mock to return default credentials
      mockConfigService.get = vi.fn((key: string, defaultValue?: string) => {
        if (key === 'ADMIN_USERNAME') return 'admin';
        if (key === 'ADMIN_PASSWORD') return 'admin123';
        return defaultValue;
      });

      const mockExec = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      mockUserModel.findOne = vi.fn(() => ({ exec: mockExec }));

      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

      const mockUser = {
        save: vi.fn().mockResolvedValue({
          _id: '456',
          username: 'admin',
          role: 'admin',
        }),
      };
      mockUserModel = Object.assign(vi.fn(() => mockUser), {
        findOne: vi.fn(() => ({ exec: mockExec })),
      });

      service = new AdminSeedService(mockUserModel, mockConfigService);
      (service as any).logger = mockLogger;

      await service.seedAdminUser();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Usando credenciais padrão para admin')
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('IMPORTANTE: Altere a senha do admin')
      );
    });

    it('should not create admin when username already exists with different role', async () => {
      // Configure mock to return default credentials for this test
      mockConfigService.get = vi.fn((key: string, defaultValue?: string) => {
        if (key === 'ADMIN_USERNAME') return 'admin';
        if (key === 'ADMIN_PASSWORD') return 'admin123';
        return defaultValue;
      });

      const mockExistingUser = {
        _id: '789',
        username: 'admin',
        role: 'user',
      };

      const mockExec = vi
        .fn()
        .mockResolvedValueOnce(null) // No admin exists
        .mockResolvedValueOnce(mockExistingUser); // But username exists

      mockUserModel.findOne = vi.fn(() => ({ exec: mockExec }));

      service = new AdminSeedService(mockUserModel, mockConfigService);
      (service as any).logger = mockLogger;

      await service.seedAdminUser();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Usuário 'admin' já existe com role 'user'")
      );
    });

    it('should handle errors during seeding without throwing', async () => {
      const mockError = new Error('Database connection failed');
      const mockExec = vi.fn().mockRejectedValue(mockError);
      mockUserModel.findOne = vi.fn(() => ({ exec: mockExec }));

      // Should not throw
      await expect(service.seedAdminUser()).resolves.not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Error seeding admin user:',
        mockError
      );
    });
  });
});
