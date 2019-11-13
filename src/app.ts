import express from 'express';
import { PORT, PRODUCTION, HOST } from './env';
import { logger } from './logger';
import http from 'http';
import https from 'https';
import io from 'socket.io';

export async function createApp(): Promise<Express.Application> {
  const httpModule = PRODUCTION ? https : http;

  return new Promise(resolve => {
    const app = express();
    const server = new httpModule.Server(app);
    const ios = io(server);

    ios.on('connection', socket => {
      socket.emit('news', { hello: 'world' });
      socket.on('my other event', data => {
        console.log(data);
      });
    });

    server.listen(PORT, HOST, () => {
      logger.log('info', `HTTP app listening on port: ${PORT}`, 'HTTP');
      resolve(app);
    });
  });
}
