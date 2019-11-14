import { Socket } from 'socket.io';

export abstract class IOService {
  constructor(readonly socket: Socket) {
    this.bindListeners();
  }

  protected abstract bindListeners(): void;
}
