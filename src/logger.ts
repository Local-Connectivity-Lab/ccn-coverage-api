import pino from 'pino';

function createLogger() {
  const logLevel = process.env.LOG_LEVEL || 'info';

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

  const transport = pino.transport({
    target: 'pino/file',
    options: {
      destination: './ccn-coverage-api.log',
      mkdir: true,
    },
  });

  const logger = pino(loggerOptions, transport);

  // Make sure logs are flushed on exit
  process.on('exit', () => {
    logger.flush();
  });

  return logger;
}

const logger = createLogger();
export default logger;
