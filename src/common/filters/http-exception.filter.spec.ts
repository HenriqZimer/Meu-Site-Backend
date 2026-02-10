import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;
  let originalEnv: string | undefined;

  beforeEach(() => {
    // Store original NODE_ENV
    originalEnv = process.env.NODE_ENV;

    // Mock Response
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Mock Request
    mockRequest = {
      url: '/api/test',
      method: 'GET',
    };

    // Mock ArgumentsHost
    mockArgumentsHost = {
      switchToHttp: vi.fn(() => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      })),
    } as unknown as ArgumentsHost;

    filter = new HttpExceptionFilter();

    // Mock logger to prevent console output during tests
    vi.spyOn(filter['logger'], 'error').mockImplementation(() => {});
    vi.spyOn(filter['logger'], 'warn').mockImplementation(() => {});

    // Reset NODE_ENV to test
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
    vi.clearAllMocks();
  });

  describe('HttpException handling', () => {
    it('should handle HttpException with string message', () => {
      const exception = new HttpException('Test error message', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test error message',
          error: 'HttpException',
          path: '/api/test',
          method: 'GET',
        }),
      );
    });

    it('should handle HttpException with object response', () => {
      const exception = new BadRequestException({
        message: 'Validation failed',
        error: 'Bad Request',
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          error: 'Bad Request',
        }),
      );
    });

    it('should handle NotFoundException', () => {
      const exception = new NotFoundException('Resource not found');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
        }),
      );
    });
  });

  describe('Non-HTTP exception handling', () => {
    it('should handle generic Error as 500 in development', () => {
      process.env.NODE_ENV = 'development';
      const exception = new Error('Database connection failed');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database connection failed',
          error: 'Internal Server Error',
          stack: expect.any(String),
        }),
      );
    });

    it('should hide error details in production', () => {
      process.env.NODE_ENV = 'production';
      const exception = new Error('Sensitive database error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro interno do servidor',
          error: 'Internal Server Error',
        }),
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.anything(),
        }),
      );
    });

    it('should handle unknown exception type in production', () => {
      process.env.NODE_ENV = 'production';
      const exception = 'Unknown error type';

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Erro interno do servidor',
          error: 'Internal Server Error',
        }),
      );
    });

    it('should handle unknown exception type in development', () => {
      process.env.NODE_ENV = 'development';
      const exception = 'Unknown error type';

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Erro desconhecido',
        }),
      );
    });
  });

  describe('Logging behavior', () => {
    it('should log error for normal exceptions', () => {
      const exception = new BadRequestException('Validation error');

      filter.catch(exception, mockArgumentsHost);

      expect(filter['logger'].error).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/test - Status: 400'),
        expect.any(String),
      );
    });

    it('should log warning for suspicious paths', () => {
      mockRequest.url = '/wp-admin/config.php';
      const exception = new NotFoundException();

      filter.catch(exception, mockArgumentsHost);

      expect(filter['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('Blocked suspicious request'),
      );
      expect(filter['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('/wp-admin/config.php'),
      );
    });
  });

  describe('isSuspiciousPath', () => {
    it('should detect .env file access attempts', () => {
      mockRequest.url = '/.env';
      const exception = new NotFoundException();

      filter.catch(exception, mockArgumentsHost);

      expect(filter['logger'].warn).toHaveBeenCalled();
    });

    it('should detect .git access attempts', () => {
      mockRequest.url = '/.git/config';
      const exception = new NotFoundException();

      filter.catch(exception, mockArgumentsHost);

      expect(filter['logger'].warn).toHaveBeenCalled();
    });

    it('should detect wp-admin access attempts', () => {
      mockRequest.url = '/wp-admin/';
      const exception = new NotFoundException();

      filter.catch(exception, mockArgumentsHost);

      expect(filter['logger'].warn).toHaveBeenCalled();
    });

    it('should detect phpmyadmin access attempts', () => {
      mockRequest.url = '/phpmyadmin/index.php';
      const exception = new NotFoundException();

      filter.catch(exception, mockArgumentsHost);

      expect(filter['logger'].warn).toHaveBeenCalled();
    });

    it('should detect sql file access attempts', () => {
      mockRequest.url = '/backup.sql';
      const exception = new NotFoundException();

      filter.catch(exception, mockArgumentsHost);

      expect(filter['logger'].warn).toHaveBeenCalled();
    });

    it('should not flag normal paths as suspicious', () => {
      mockRequest.url = '/api/users';
      const exception = new BadRequestException();

      filter.catch(exception, mockArgumentsHost);

      expect(filter['logger'].warn).not.toHaveBeenCalled();
      expect(filter['logger'].error).toHaveBeenCalled();
    });
  });

  describe('Response format', () => {
    it('should include timestamp in ISO format', () => {
      const exception = new BadRequestException();
      const beforeTime = new Date().toISOString();

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp);
    });

    it('should include request path and method', () => {
      mockRequest.url = '/api/custom/endpoint';
      mockRequest.method = 'POST';
      const exception = new BadRequestException();

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/custom/endpoint',
          method: 'POST',
        }),
      );
    });

    it('should include stack trace only in non-production', () => {
      process.env.NODE_ENV = 'development';
      const exception = new Error('Test error');

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.stack).toBeDefined();
    });
  });
});
