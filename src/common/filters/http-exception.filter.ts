import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Exception Filter Global
 *
 * Intercepta todas as exceções da aplicação e formata as respostas de erro
 *
 * Benefícios:
 * - Padroniza formato de erro em toda a API
 * - Oculta stack traces em produção (segurança)
 * - Registra erros para monitoramento
 * - Retorna mensagens amigáveis ao cliente
 *
 * Uso: Registrado globalmente em main.ts via app.useGlobalFilters()
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProduction = process.env.NODE_ENV === 'production';

    // Determina status code e mensagem baseado no tipo de exceção
    let status: number;
    let message: string | object;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else {
        const resp = exceptionResponse as any;
        message = resp.message || exceptionResponse;
        error = resp.error || exception.name;
      }
    } else {
      // Erro não tratado (500)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = isProduction
        ? 'Erro interno do servidor'
        : exception instanceof Error
          ? exception.message
          : 'Erro desconhecido';
      error = 'Internal Server Error';
    }

    // Log do erro para monitoramento
    // Reduz nível de log para tentativas comuns de scanners/bots
    const isSuspiciousPath = this.isSuspiciousPath(request.url);
    const logLevel = isSuspiciousPath && status === 404 ? 'warn' : 'error';

    if (logLevel === 'warn') {
      this.logger.warn(
        `🔒 Blocked suspicious request: ${request.method} ${request.url} - Status: ${status}`,
      );
    } else {
      this.logger.error(
        `${request.method} ${request.url} - Status: ${status}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    }

    // Formata resposta de erro
    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    // Apenas inclui stack trace em desenvolvimento
    if (!isProduction && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Detecta tentativas de acesso a arquivos sensíveis
   */
  private isSuspiciousPath(url: string): boolean {
    const suspiciousPatterns = [
      '.env',
      '.git',
      '.ssh',
      'wp-admin',
      'wp-login',
      'phpmyadmin',
      'config.php',
      'admin.php',
      'backup',
      '.sql',
      '.zip',
      '.tar.gz',
    ];

    return suspiciousPatterns.some((pattern) => url.toLowerCase().includes(pattern));
  }
}
