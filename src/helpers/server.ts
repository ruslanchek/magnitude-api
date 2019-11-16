import express from 'express';
import http from 'http';
import https from 'https';
import io, { Server } from 'socket.io';
import { PORT, PRODUCTION, HOST } from '../env';
import { logger } from './logger';
import { SocketAuthService } from '../socket/auth/auth.service';

function startExpressServices(app: Express.Application) {}

function startIoServices(ioServer: Server) {
  ioServer.on('connect', socket => {
    logger.log('debug', `IO client ${socket.id} connected`);
    new SocketAuthService(socket);

    socket.on('disconnect', () => {
      logger.log('debug', `IO client ${socket.id} disconnected`);
    });
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
