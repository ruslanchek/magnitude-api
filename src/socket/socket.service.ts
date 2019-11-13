import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

interface ISocketAuthData {
  token: string;
}

@WebSocketGateway()
export class SocketService {
  @WebSocketServer()
  // @ts-ignore
  server: Server;

  @SubscribeMessage('authorize')
  echo(@MessageBody() data: ISocketAuthData) {
    console.log(data);
  }

  public send<T = any>(event: string, data: T) {
    this.server.emit(event, data);
  }
}
