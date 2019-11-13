import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Client } from 'socket.io';
import * as jsonwebtoken from 'jsonwebtoken';
import { jwtConstants } from '../constants';
import { IJwtSignPayload } from '../auth/jwt.strategy';

interface ISocketClient {
  id: string;
  userId: string;
  client: Client;
}

interface IAuthPayload {
  token: string;
}

const UNAUTHORIZED_MESSAGE_DATA = 'unauthorized';

@WebSocketGateway()
export class SocketService {
  @WebSocketServer()
  // @ts-ignore
  server: Server;
  clients: ISocketClient[] = [];

  @SubscribeMessage('authorize')
  onEvent(@MessageBody() data: IAuthPayload, @ConnectedSocket() client: Client) {
    const clientIndex = this.clients.findIndex(c => c.id === client.id);

    console.log('xx');

    try {
      const jwtData = jsonwebtoken.verify(data.token, jwtConstants.secret) as IJwtSignPayload;

      if (jwtData && jwtData.userId) {
        const newClient: ISocketClient = {
          id: client.id,
          userId: jwtData.userId,
          client,
        };

        if (clientIndex >= 0) {
          this.clients[clientIndex] = newClient;
        } else {
          this.clients.push(newClient);
        }

        client.server.emit('authorize', true);
      } else {
        client.server.emit('authorize', UNAUTHORIZED_MESSAGE_DATA);
      }
    } catch (e) {
      // client.server.emit('authorize', UNAUTHORIZED_MESSAGE_DATA);
    }
  }

  public send<T = any>(userId: string, event: string, data: T) {
    const clientIndex = this.clients.findIndex(c => c.userId === userId);

    if (clientIndex >= 0) {
      // this.clients[clientIndex].client.server.emit(event, data);
    }
  }
}
