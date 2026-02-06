import pino from 'pino';

export type Logger = pino.Logger;

export function createLogger(name?: string, level?: string): Logger {
  const logLevel = level ?? process.env['LOG_LEVEL'] ?? 'info';
  const isDev = process.env['NODE_ENV'] !== 'production';

  return pino({
    name: name ?? 'flywheel',
    level: logLevel,
    ...(isDev
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : {}),
  });
}

export const logger = createLogger();
