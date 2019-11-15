import { Socket } from 'socket.io';
import { SocketService, IJwtPayload } from './SocketService';
import {
  ESocketAction,
  IClientDtoAuthAuthorize,
  IClientDtoAuthRegister,
  IServerDtoAuthRegister,
  ESocketError,
} from '@ruslanchek/magnitude-shared';
import { ModelUser, getUserByEmail } from '../models/UserModel';
import jsonwebtoken from 'jsonwebtoken';
import { JWT_SECRET } from '../env';
import { EErrorMessages } from '../messages/error.messages';

export class SocketAuthService extends SocketService {
  constructor(readonly socket: Socket) {
    super(socket);
  }

  private generateToken(jwtPayload: IJwtPayload): string {
    return jsonwebtoken.sign(jwtPayload, JWT_SECRET);
  }

  protected bindListeners() {
    this.listen<IClientDtoAuthAuthorize>(ESocketAction.AuthAuthorize, true, async (packet, answerActionName) => {
      this.socket.emit(answerActionName, this.formPacket({}, null));
    });

    this.listen<IClientDtoAuthRegister>(ESocketAction.AuthRegister, false, async (packet, answerActionName) => {
      const existingUser = await getUserByEmail(packet.data.email);

      if (existingUser) {
        this.socket.emit(
          answerActionName,
          this.formPacket(null, ESocketError.BadRequest, EErrorMessages.UserAlreadyExists),
        );
      } else {
        const newUser = new ModelUser({
          email: packet.data.email,
          passwordHash: packet.data.password,
        });

        await newUser.save();

        const dto: IServerDtoAuthRegister = {
          token: this.generateToken({
            userId: newUser.id,
          }),
        };

        this.socket.emit(answerActionName, this.formPacket(dto, null));
      }
    });
  }
}
