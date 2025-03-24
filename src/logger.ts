import path from 'path';
import pino, { multistream } from 'pino';

function createLogger() {
  const logLevel = process.env.LOG_LEVEL || 'debug';

  // Configure the logger
  const loggerOptions: pino.LoggerOptions = {
    level: logLevel,
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    formatters: {
      level: (label: string) => {
        return { level: label };
      },
    },
    base: {
      app: 'ccn-coverage-api',
    },

    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  };

  const logStreams = pino.multistream([
    { level: 'debug', stream: process.stdout },
    { level: 'warn', stream: process.stderr },
  ]);

  const logger = pino(loggerOptions, logStreams);

  // Make sure logs are flushed on exit
  process.on('exit', () => {
    logger.flush();
  });

  return logger;
}

const logger = createLogger();
export default logger;
