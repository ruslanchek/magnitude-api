import { Socket } from 'socket.io';
import { SocketService, IJwtPayload } from '../../services/SocketService';
import {
  ESocketAction,
  IClientDtoAuthAuthorize,
  IClientDtoAuthRegister,
  IServerDtoAuthRegister,
  ESocketError,
  IServerDtoAuthAuthorize,
} from '@ruslanchek/magnitude-shared';
import { ModelUser, getUserByEmail } from '../../models/UserModel';
import jsonwebtoken from 'jsonwebtoken';
import { JWT_SECRET } from '../../env';
import { EAuthErrorMessages } from './auth.messages';
import { AuthRegisterDtoValidator } from './auth.validators';

export class SocketAuthService extends SocketService {
  constructor(readonly socket: Socket) {
    super(socket);
  }

  private generateToken(jwtPayload: IJwtPayload): string {
    return jsonwebtoken.sign(jwtPayload, JWT_SECRET);
  }

  protected bindListeners() {
    this.listen<IClientDtoAuthAuthorize>(ESocketAction.AuthAuthorize, null, false, async (packet, answerActionName) => {
      this.socket.emit(answerActionName, this.formPacket<IServerDtoAuthAuthorize>({}, null));
    });

    this.listen<IClientDtoAuthRegister>(
      ESocketAction.AuthRegister,
      new AuthRegisterDtoValidator(),
      false,
      async (packet, answerActionName) => {
        const existingUser = await getUserByEmail(packet.data.email);

        if (existingUser) {
          this.socket.emit(
            answerActionName,
            this.formPacket(null, ESocketError.BadRequest, EAuthErrorMessages.UserAlreadyExists),
          );
        } else {
          const newUser = new ModelUser({
            email: packet.data.email,
            passwordHash: packet.data.password,
          });

          await newUser.save();

          const dto = {
            token: this.generateToken({
              userId: newUser.id,
            }),
          };

          this.socket.emit(answerActionName, this.formPacket<IServerDtoAuthRegister>(dto, null));
        }
      },
    );
  }
}
