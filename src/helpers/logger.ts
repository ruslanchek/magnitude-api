import winston from 'winston';

const consoleFormat = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.timestamp({
    format: 'HH:MM:SS',
  }),
  winston.format.printf(info => `[${info.level}] ${info.timestamp} ${info.message}`),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YY-MM-DD HH:MM:SS',
  }),
  winston.format.printf(info => `[${info.level.toUpperCase()}] ${info.timestamp} ${info.message}`),
);

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), consoleFormat),
      level: 'debug',
    }),
    new winston.transports.File({ filename: './logs/error.log', level: 'error', format: fileFormat }),
    new winston.transports.File({ filename: './logs/debug.log', level: 'debug', format: fileFormat }),
  ],
});
