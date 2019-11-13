import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server | undefined;

  @SubscribeMessage('events')
  echo(@MessageBody() data: any): WsResponse<any> {
    setTimeout(() => {
      this.server?.send('events', {eee: 1})
    }, 1000);

    return data;
  }
}
