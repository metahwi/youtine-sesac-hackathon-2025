/**
 * Logger Utility
 * Provides environment-aware logging with different levels
 * In production, logs are suppressed unless critical
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isTest = import.meta.env.MODE === 'test';

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor(context = '') {
    this.context = context;
    this.minLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  /**
   * Format log message with context and timestamp
   */
  _format(level, ...args) {
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? `[${this.context}]` : '';
    return [`[${timestamp}] ${level}${contextStr}:`, ...args];
  }

  /**
   * Debug level - development only
   */
  debug(...args) {
    if (isDevelopment && !isTest) {
      console.log(...this._format('DEBUG', ...args));
    }
  }

  /**
   * Info level - development only
   */
  info(...args) {
    if (isDevelopment && !isTest) {
      console.info(...this._format('INFO', ...args));
    }
  }

  /**
   * Warning level - always logged
   */
  warn(...args) {
    if (!isTest) {
      console.warn(...this._format('WARN', ...args));
    }
  }

  /**
   * Error level - always logged
   */
  error(...args) {
    if (!isTest) {
      console.error(...this._format('ERROR', ...args));
    }
  }

  /**
   * Group logging for related messages
   */
  group(label, callback) {
    if (isDevelopment && !isTest) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }

  /**
   * Table logging for structured data
   */
  table(data) {
    if (isDevelopment && !isTest) {
      console.table(data);
    }
  }
}

/**
 * Create a logger instance with optional context
 * @param {string} context - Component or module name
 * @returns {Logger}
 */
export function createLogger(context) {
  return new Logger(context);
}

/**
 * Default logger instance
 */
export const logger = new Logger();

export default logger;
