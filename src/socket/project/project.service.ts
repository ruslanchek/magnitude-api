import { Socket } from 'socket.io';
import { SocketService } from '../../services/SocketService';

export class SocketProjectService extends SocketService {
  constructor(readonly socket: Socket) {
    super(socket);
  }

  protected bindListeners() {}
}
