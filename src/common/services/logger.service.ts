// logger.service.ts

import * as winston from 'winston';
import { LoggerOptions } from 'winston';
import { LoggerService } from '@nestjs/common';
import 'winston-daily-rotate-file';

export interface AppLoggerService extends LoggerService {
  log(message: string, ...meta: any[]): void;
  debug(message: string, ...meta: any[]): void;
  error(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  verbose(message: string, ...meta: any[]): void;
}

class AppLogger implements AppLoggerService {
  private readonly logger: winston.Logger;
  public loggerOptions: LoggerOptions;
  constructor(
    private context: string,
    logLevel: string,
  ) {
    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.json(),
      transports: [
        new winston.transports.DailyRotateFile({
          dirname: 'log',
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
          createSymlink: true,
          symlinkName: 'error.log',
        }),
        new winston.transports.DailyRotateFile({
          dirname: 'log',
          filename: 'combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          createSymlink: true,
          symlinkName: 'combined.log',
        }),
      ],
    });
  }
  log(message: string, ...meta: any[]): void {
    this.winstonLog('info', message, ...meta);
  }
  debug(message: string, ...meta: any[]): void {
    this.winstonLog('debug', message, ...meta);
  }
  error(message: string, ...meta: any[]): void {
    this.winstonLog('error', message, ...meta);
  }
  warn(message: string, ...meta: any[]): void {
    this.winstonLog('warn', message, ...meta);
  }
  verbose(message: string, ...meta: any[]): void {
    this.winstonLog('verbose', message, ...meta);
  }

  private winstonLog(level: string, message: string, ...meta: any[]) {
    const currentDate = new Date();
    this.logger.log(level, message, {
      timestamp: currentDate.toISOString(),
      context: this.context,
      ...meta,
    });
  }
}

export class LoggerFactory {
  static LogLevel = 'silly';
  static create(context: string): AppLoggerService {
    return new AppLogger(context, LoggerFactory.LogLevel);
  }
}

export const logger = LoggerFactory.create('App');
