// Structured JSON logging. Keeps timestamps and request context in one place.
// In production this can be shipped to any log aggregator.

type Level = 'info' | 'warn' | 'error' | 'debug';

function write(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry: Record<string, unknown> = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  if (meta) Object.assign(entry, meta);

  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(entry));
  } else {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') write('debug', message, meta);
  },
};
