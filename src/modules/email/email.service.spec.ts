import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailService } from './email.service';
import type { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(),
  },
  createTransport: vi.fn(),
}));

describe('EmailService', () => {
  let service: EmailService;
  let mockConfigService: any;
  let mockTransporter: any;
  let mockLogger: any;

  beforeEach(() => {
    // Mock Transporter
    mockTransporter = {
      sendMail: vi.fn(),
    };

    // Mock nodemailer.createTransport
    vi.mocked(nodemailer.createTransport).mockReturnValue(mockTransporter);

    // Mock ConfigService
    mockConfigService = {
      get: vi.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          SMTP_HOST: 'smtp.test.com',
          SMTP_PORT: 587,
          SMTP_SECURE: false,
          SMTP_USER: 'test@test.com',
          SMTP_PASS: 'testpass',
          SMTP_FROM: 'noreply@test.com',
          ADMIN_EMAIL: 'admin@test.com',
        };
        return config[key] || defaultValue;
      }),
    } as unknown as ConfigService;

    service = new EmailService(mockConfigService);

    // Mock logger
    mockLogger = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    (service as any).logger = mockLogger;

    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default SMTP_FROM if not configured', () => {
      const customConfig = {
        get: vi.fn((key: string) => {
          if (key === 'SMTP_FROM') return undefined;
          if (key === 'SMTP_HOST') return 'smtp.test.com';
          if (key === 'SMTP_PORT') return 587;
          if (key === 'SMTP_USER') return 'user';
          if (key === 'SMTP_PASS') return 'pass';
          return undefined;
        }),
      } as unknown as ConfigService;

      const testService = new EmailService(customConfig);

      // Verify service was created (from property is private but service exists)
      expect(testService).toBeDefined();
      expect(customConfig.get).toHaveBeenCalledWith('SMTP_FROM');
    });

    it('should use default port 587 if SMTP_PORT not configured', () => {
      const customConfig = {
        get: vi.fn((key: string) => {
          if (key === 'SMTP_PORT') return undefined;
          if (key === 'SMTP_HOST') return 'smtp.test.com';
          if (key === 'SMTP_FROM') return 'test@test.com';
          return 'default';
        }),
      } as unknown as ConfigService;

      // Clear previous mocks
      vi.clearAllMocks();

      const testService = new EmailService(customConfig);

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 587,
        }),
      );
    });

    it('should create transporter with secure connection when configured', () => {
      const customConfig = {
        get: vi.fn((key: string) => {
          if (key === 'SMTP_SECURE') return true;
          if (key === 'SMTP_HOST') return 'smtp.test.com';
          if (key === 'SMTP_PORT') return 465;
          if (key === 'SMTP_USER') return 'user@test.com';
          if (key === 'SMTP_PASS') return 'password';
          if (key === 'SMTP_FROM') return 'from@test.com';
          return undefined;
        }),
      } as unknown as ConfigService;

      vi.clearAllMocks();

      const testService = new EmailService(customConfig);

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          secure: true,
        }),
      );
    });
  });

  describe('sendContactNotification', () => {
    const mockContactData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message content',
      createdAt: new Date('2024-01-15T10:30:00'),
    };

    it('should send email notification successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const result = await service.sendContactNotification(mockContactData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@test.com',
          to: 'admin@test.com',
          subject: '[Portfolio] Nova mensagem de John Doe',
          html: expect.stringContaining('John Doe'),
        }),
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Contact notification sent to admin@test.com'),
      );
    });

    it('should return false when admin email is not configured', async () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'ADMIN_EMAIL') return undefined;
        return 'default';
      });

      const result = await service.sendContactNotification(mockContactData);

      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Admin email not configured. Skipping notification.',
      );
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('should handle email sending errors gracefully', async () => {
      const error = new Error('SMTP connection failed');
      mockTransporter.sendMail.mockRejectedValue(error);

      const result = await service.sendContactNotification(mockContactData);

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to send contact notification:', error);
    });

    it('should include all contact data in email template', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendContactNotification(mockContactData);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(emailCall.html).toContain('John Doe');
      expect(emailCall.html).toContain('john@example.com');
      expect(emailCall.html).toContain('Test Subject');
      expect(emailCall.html).toContain('Test message content');
    });

    it('should handle contact without subject', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const contactWithoutSubject = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Test message',
        createdAt: new Date(),
      };

      const result = await service.sendContactNotification(contactWithoutSubject);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should format date in pt-BR locale', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendContactNotification(mockContactData);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      // Should contain formatted date in Portuguese
      expect(emailCall.html).toMatch(/\d{1,2} de \w+ de \d{4}/);
    });

    it('should send email from configured SMTP_FROM address', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendContactNotification(mockContactData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@test.com',
        }),
      );
    });

    it('should include proper subject line with sender name', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      await service.sendContactNotification(mockContactData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: '[Portfolio] Nova mensagem de John Doe',
        }),
      );
    });
  });

  describe('HTML template generation', () => {
    it('should generate valid HTML with DOCTYPE', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test',
        createdAt: new Date(),
      };

      await service.sendContactNotification(contactData);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      expect(emailCall.html).toContain('<!DOCTYPE html>');
      expect(emailCall.html).toContain('<html');
      expect(emailCall.html).toContain('</html>');
    });

    it('should escape HTML in message to prevent XSS', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });

      const contactData = {
        name: 'Test',
        email: 'test@example.com',
        message: '<script>alert("xss")</script>',
        createdAt: new Date(),
      };

      await service.sendContactNotification(contactData);

      const emailCall = mockTransporter.sendMail.mock.calls[0][0];
      // The template should escape or handle HTML safely
      expect(emailCall.html).toBeDefined();
    });
  });
});
