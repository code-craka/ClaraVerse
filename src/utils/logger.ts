/**
 * logger.ts
 *
 * A simple logging utility that wraps console methods.
 * This allows for future expansion, such as sending logs to a server,
 * integrating with a more sophisticated logging library, or communicating
 * logs to the Electron main process.
 */

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

const getTimestamp = (): string => new Date().toISOString();

const formatMessage = (level: LogLevel, messages: any[]): string => {
  const timestamp = getTimestamp();
  const messageStrings = messages.map(msg => {
    if (typeof msg === 'string') {
      return msg;
    }
    try {
      return JSON.stringify(msg, null, 2); // Pretty print objects
    } catch (e) {
      return String(msg); // Fallback for unstringifiable objects
    }
  });
  return `[${timestamp}] [${level}] ${messageStrings.join(' ')}`;
};

const log = (...messages: any[]): void => {
  console.log(formatMessage(LogLevel.INFO, messages));
};

const debug = (...messages: any[]): void => {
  // In development, log debug messages. In production, this could be a no-op
  // or controlled by an environment variable or settings.
  if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && (window as any).IS_DEV_MODE)) {
    console.debug(formatMessage(LogLevel.DEBUG, messages));
  }
};

const info = (...messages: any[]): void => {
  console.info(formatMessage(LogLevel.INFO, messages));
};

const warn = (...messages: any[]): void => {
  console.warn(formatMessage(LogLevel.WARN, messages));
};

const error = (message: string | Error, ...additionalInfo: any[]): void => {
  if (message instanceof Error) {
    console.error(formatMessage(LogLevel.ERROR, [message.message, ...additionalInfo]));
    if (message.stack) {
      console.error(message.stack);
    }
  } else {
    console.error(formatMessage(LogLevel.ERROR, [message, ...additionalInfo]));
  }
  // Future: Send error to Electron main process or a remote logging service
  // if (typeof window !== 'undefined' && window.electron && window.electron.logError) {
  //   window.electron.logError(message, ...additionalInfo);
  // }
};

// Example of a more specific logger for a module
const createLogger = (moduleName: string) => ({
  log: (...messages: any[]) => log(`[${moduleName}]`, ...messages),
  debug: (...messages: any[]) => debug(`[${moduleName}]`, ...messages),
  info: (...messages: any[]) => info(`[${moduleName}]`, ...messages),
  warn: (...messages: any[]) => warn(`[${moduleName}]`, ...messages),
  error: (message: string | Error, ...additionalInfo: any[]) => error(message, `[${moduleName}]`, ...additionalInfo),
});

export { log, debug, info, warn, error, createLogger, LogLevel };

// Basic usage example:
// import logger from './logger'; OR import { log, error } from './logger';
//
// log('This is a general log message.');
// info('User logged in:', { userId: 123 });
// warn('API deprecated:', '/old/api/endpoint');
// error('Failed to load resource', { url: '/data.json', status: 404 });
// error(new Error('Something broke'), { context: 'During payment processing' });
//
// const authLogger = createLogger('AuthService');
// authLogger.info('User authentication successful.');
// authLogger.error('Password validation failed.');
