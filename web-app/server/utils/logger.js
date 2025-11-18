/**
 * Server Logger Utility
 * Provides structured logging with different levels and formatting
 * Can be easily extended to use Winston or other logging libraries
 */

const isDevelopment = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class Logger {
  constructor(context = '') {
    this.context = context;
    this.minLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  /**
   * Format timestamp
   */
  _getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message with color and context
   */
  _format(level, color, ...args) {
    const timestamp = this._getTimestamp();
    const contextStr = this.context ? `[${this.context}]` : '';

    if (isDevelopment && !isTest) {
      return `${colors.dim}${timestamp}${colors.reset} ${color}${level}${colors.reset}${contextStr}: `;
    }

    // Production format (JSON for log aggregation)
    return '';
  }

  /**
   * Log in JSON format for production
   */
  _logJson(level, ...args) {
    const logEntry = {
      timestamp: this._getTimestamp(),
      level,
      context: this.context,
      message: args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '),
    };
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Debug level - development only
   */
  debug(...args) {
    if (isDevelopment && !isTest) {
      console.log(this._format('DEBUG', colors.blue), ...args);
    }
  }

  /**
   * Info level
   */
  info(...args) {
    if (isTest) return;

    if (isDevelopment) {
      console.info(this._format('INFO', colors.cyan), ...args);
    } else {
      this._logJson('INFO', ...args);
    }
  }

  /**
   * Success level - for highlighting successful operations
   */
  success(...args) {
    if (isTest) return;

    if (isDevelopment) {
      console.log(this._format('SUCCESS', colors.green), ...args);
    } else {
      this._logJson('INFO', ...args);
    }
  }

  /**
   * Warning level
   */
  warn(...args) {
    if (isTest) return;

    if (isDevelopment) {
      console.warn(this._format('WARN', colors.yellow), ...args);
    } else {
      this._logJson('WARN', ...args);
    }
  }

  /**
   * Error level
   */
  error(...args) {
    if (isTest) return;

    if (isDevelopment) {
      console.error(this._format('ERROR', colors.red), ...args);
    } else {
      this._logJson('ERROR', ...args);
    }
  }

  /**
   * HTTP request logging
   */
  http(method, path, statusCode, duration) {
    if (isTest) return;

    const color = statusCode >= 500 ? colors.red :
                  statusCode >= 400 ? colors.yellow :
                  statusCode >= 300 ? colors.cyan :
                  colors.green;

    if (isDevelopment) {
      console.log(
        this._format('HTTP', color),
        `${method} ${path} ${statusCode} - ${duration}ms`
      );
    } else {
      this._logJson('HTTP', method, path, statusCode, `${duration}ms`);
    }
  }
}

/**
 * Create a logger instance with optional context
 * @param {string} context - Module or function name
 * @returns {Logger}
 */
function createLogger(context) {
  return new Logger(context);
}

/**
 * Default logger instance
 */
const logger = new Logger();

module.exports = {
  createLogger,
  logger,
};
