import { Socket } from 'socket.io';
import { IOService } from './IOService';

export class IOAuthService extends IOService {
  constructor(readonly socket: Socket) {
    super(socket);
  }

  protected bindListeners() {
    this.socket.on('message', (data: any) => {
      console.log(data);
    });
  }
}
