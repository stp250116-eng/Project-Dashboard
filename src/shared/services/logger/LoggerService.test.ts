import { LoggerService } from './LoggerService';

describe('LoggerService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('routes error logs to console.error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    LoggerService.error('boom', { id: 1 });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('boom');
  });

  it('logs an error without context', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    LoggerService.error('bare');
    expect(spy.mock.calls[0][1]).toBe('');
  });

  it('routes warn logs to console.warn', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    LoggerService.warn('careful');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('exposes all log levels', () => {
    expect(typeof LoggerService.debug).toBe('function');
    expect(typeof LoggerService.info).toBe('function');
    expect(typeof LoggerService.warn).toBe('function');
    expect(typeof LoggerService.error).toBe('function');
  });

  it('routes info and debug logs to console.info in dev (with and without context)', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    LoggerService.info('hello', { user: 'a' });
    LoggerService.debug('inspecting');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toContain('hello');
    expect(spy.mock.calls[0][1]).toEqual({ user: 'a' });
    expect(spy.mock.calls[1][1]).toBe('');
  });
});
