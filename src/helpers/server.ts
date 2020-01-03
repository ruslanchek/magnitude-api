import express from 'express';
import http from 'http';
import https from 'https';
import io, { Server } from 'socket.io';
import { PORT, PRODUCTION, HOST } from '../env';
import { logger } from './logger';
import { SocketAuthService } from '../socket/auth/auth.service';
import { SocketProjectService } from '../socket/project/project.service';

function startExpressServices(app: Express.Application) {}

function startIoServices(ioServer: Server) {
  ioServer.on('connect', socket => {
    logger.log('debug', `[${socket.id}] client connected`);
    new SocketAuthService(socket, ioServer);
    new SocketProjectService(socket, ioServer);

    socket.on('disconnect', () => {
      logger.log('debug', `[${socket.id}] client disconnected`);
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

    expressApp.get('/health-check', (req, res) => {
      res.send('OK');
    });

    server.listen(PORT, HOST, () => {
      logger.log('info', `IO Server is listening on ${ioProtocol}://${HOST}:${PORT}`);
      logger.log('info', `Express App is listening on ${httpProtocol}://${HOST}:${PORT}`);
      resolve();
    });
  });
}
