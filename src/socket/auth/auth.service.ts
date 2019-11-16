import { Socket } from 'socket.io';
import { SocketService, IJwtPayload } from '../../services/SocketService';
import {
  ESocketAction,
  IClientDtoAuthAuthorize,
  IClientDtoAuthRegister,
  IServerDtoAuthRegister,
  ESocketError,
  IServerDtoAuthAuthorize,
  IClientDtoAuthLogin,
  IServerDtoAuthLogin,
} from '@ruslanchek/magnitude-shared';
import { ModelUser, getUserByEmail } from '../../models/UserModel';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from '../../env';
import { EAuthErrorMessages } from './auth.messages';
import { AuthRegisterDtoValidator, AuthLoginDtoValidator } from './auth.validators';

export class SocketAuthService extends SocketService {
  constructor(readonly socket: Socket) {
    super(socket);
  }

  private generateToken(jwtPayload: IJwtPayload): string {
    return jsonwebtoken.sign(jwtPayload, JWT_SECRET);
  }

  private cryptPassword(rawPassword: string): string {
    return bcrypt.hashSync(rawPassword, bcrypt.genSaltSync(10));
  }

  private verifyPassword(rawPassword: string, encryptedPassword: string): boolean {
    return bcrypt.compareSync(rawPassword, encryptedPassword);
  }

  protected bindListeners() {
    this.listen<IClientDtoAuthAuthorize>(ESocketAction.AuthAuthorize, null, false, async (packet, action) => {
      this.socket.emit(action, this.formPacket<IServerDtoAuthAuthorize>({}, null));
    });

    this.listen<IClientDtoAuthLogin>(
      ESocketAction.AuthLogin,
      new AuthLoginDtoValidator(),
      false,
      async (packet, action) => {
        const existingUser = await getUserByEmail(packet.data.email, ['passwordHash']);

        if (existingUser && this.verifyPassword(packet.data.password, existingUser.passwordHash)) {
          const dto = {
            token: this.generateToken({
              userId: existingUser.id,
            }),
          };

          this.socket.emit(action, this.formPacket<IServerDtoAuthLogin>(dto, null));
        } else {
          this.socket.emit(
            action,
            this.formPacket(null, ESocketError.BadRequest, EAuthErrorMessages.UserCredentialsWrong),
          );
        }
      },
    );

    this.listen<IClientDtoAuthRegister>(
      ESocketAction.AuthRegister,
      new AuthRegisterDtoValidator(),
      false,
      async (packet, action) => {
        const existingUser = await getUserByEmail(packet.data.email);

        if (existingUser) {
          this.socket.emit(
            action,
            this.formPacket(null, ESocketError.BadRequest, EAuthErrorMessages.UserAlreadyExists),
          );
        } else {
          const newUser = new ModelUser({
            email: packet.data.email,
            passwordHash: this.cryptPassword(packet.data.password),
          });

          await newUser.save();

          const dto = {
            token: this.generateToken({
              userId: newUser.id,
            }),
          };

          this.socket.emit(action, this.formPacket<IServerDtoAuthRegister>(dto, null));
        }
      },
    );
  }
}
