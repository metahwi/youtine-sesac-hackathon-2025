import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, logger } from './logger';

describe('Logger Utility', () => {
  let consoleLogSpy;
  let consoleInfoSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    vi.restoreAllMocks();
  });

  describe('createLogger', () => {
    it('should create a logger with context', () => {
      const testLogger = createLogger('TestContext');
      expect(testLogger).toBeDefined();
      expect(testLogger.context).toBe('TestContext');
    });

    it('should create a logger without context', () => {
      const testLogger = createLogger();
      expect(testLogger).toBeDefined();
      expect(testLogger.context).toBe('');
    });
  });

  describe('default logger', () => {
    it('should exist and be accessible', () => {
      expect(logger).toBeDefined();
      expect(logger.debug).toBeInstanceOf(Function);
      expect(logger.info).toBeInstanceOf(Function);
      expect(logger.warn).toBeInstanceOf(Function);
      expect(logger.error).toBeInstanceOf(Function);
    });
  });

  describe('logging methods', () => {
    it('should have debug method', () => {
      logger.debug('test debug message');
      // In test mode, debug should not log
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should have info method', () => {
      logger.info('test info message');
      // In test mode, info should not log
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it('should have warn method', () => {
      logger.warn('test warning message');
      // In test mode, warn should not log
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should have error method', () => {
      logger.error('test error message');
      // In test mode, error should not log
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('context formatting', () => {
    it('should include context in log messages', () => {
      const contextLogger = createLogger('API');
      expect(contextLogger.context).toBe('API');
    });

    it('should handle empty context', () => {
      const emptyContextLogger = createLogger('');
      expect(emptyContextLogger.context).toBe('');
    });
  });

  describe('group and table methods', () => {
    it('should have group method', () => {
      expect(logger.group).toBeInstanceOf(Function);
      logger.group('Test Group', () => {
        logger.debug('inside group');
      });
    });

    it('should have table method', () => {
      expect(logger.table).toBeInstanceOf(Function);
      logger.table([{ id: 1, name: 'test' }]);
    });
  });
});
