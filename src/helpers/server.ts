import express from 'express';
import http from 'http';
import https from 'https';
import io, { Server } from 'socket.io';
import { PORT, PRODUCTION, HOST } from '../env';
import { logger } from './logger';
import { IOAuthService } from '../io-services/IOAuthService';

function startExpressServices(app: Express.Application) {}

function startIoServices(ioServer: Server) {
  ioServer.on('connection', socket => {
    logger.log('debug', `IO Client connected`);
    new IOAuthService(socket);
  });
}

export async function createServer(): Promise<void> {
  new Promise(resolve => {
    let httpModule = PRODUCTION ? https : http;
    let httpProtocol = PRODUCTION ? 'https' : 'http';
    let ioProtocol = PRODUCTION ? 'wss' : 'ws';

    const expressApp = express();
    const server = new httpModule.Server(expressApp);
    const ioServer = io(server);

    startExpressServices(expressApp);
    startIoServices(ioServer);

    server.listen(PORT, HOST, () => {
      logger.log('info', `IO Server is listening on ${ioProtocol}://${HOST}:${PORT}`);
      logger.log('info', `Express App is listening on ${httpProtocol}://${HOST}:${PORT}`);
      resolve();
    });
  });
}
