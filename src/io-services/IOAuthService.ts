import { Socket } from 'socket.io';
import { IOService } from './IOService';
import { ESocketAction, ISocketApiPacket } from '@ruslanchek/magnitude-shared';

export class IOAuthService extends IOService {
  constructor(readonly socket: Socket) {
    super(socket);
  }

  protected bindListeners() {
    this.socket.on(ESocketAction.Authorize, (packet: ISocketApiPacket<{}>) => {
      console.log(packet);
    });
  }
}
