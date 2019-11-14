import { Socket } from 'socket.io';
import { IOService } from './IOService';
import {
  ESocketAction,
  ISocketClientPacket,
  IClientDtoAuthAuthorize,
  IClientDtoAuthRegister,
} from '@ruslanchek/magnitude-shared';
import { ModelUser } from '../models/UserModel';
import { logger } from '../helpers/logger';

export class IOAuthService extends IOService {
  constructor(readonly socket: Socket) {
    super(socket);
  }

  protected bindListeners() {
    this.socket.on(ESocketAction.AuthAuthorize, (packet: ISocketClientPacket<IClientDtoAuthAuthorize>) => {
      const authorized = this.authorizePacket(packet);

      if (authorized) {
        this.socket.emit(this.getActionName(ESocketAction.AuthAuthorize, packet), this.formPacket({}, null));
      }
    });

    this.socket.on(ESocketAction.AuthRegister, async (packet: ISocketClientPacket<IClientDtoAuthRegister>) => {
      let data = null;
      let error = null;

      try {
        const newUser = new ModelUser({
          email: packet.data.email,
          passwordHash: packet.data.password,
        });
        await newUser.save();
      } catch (e) {
        logger.log('error', e.message);
      }

      this.socket.emit(this.getActionName(ESocketAction.AuthRegister, packet), this.formPacket(data, error));
    });
  }
}
