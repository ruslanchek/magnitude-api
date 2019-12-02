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
  IServerDtoAuthMe,
  IClientDtoAuthMe,
} from '@ruslanchek/magnitude-shared';
import { ModelUser, getUserByEmail, formSharedUserObject, getUserById } from '../../models/UserModel';
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
    this.listen<IClientDtoAuthAuthorize>(ESocketAction.AuthAuthorize, null, true, async (packet, action) => {
      this.send<IServerDtoAuthAuthorize>(action, {}, null);
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

          this.send<IServerDtoAuthLogin>(action, dto, null);
        } else {
          this.send<IServerDtoAuthLogin>(
            action,
            null,
            ESocketError.BadRequest,
            EAuthErrorMessages.UserCredentialsWrong,
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
          this.send<IServerDtoAuthRegister>(
            action,
            null,
            ESocketError.BadRequest,
            EAuthErrorMessages.UserAlreadyExists,
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

          this.send<IServerDtoAuthRegister>(action, dto, null);
        }
      },
    );

    this.listen<IClientDtoAuthMe>(ESocketAction.AuthMe, null, true, async (packet, action, user) => {
      const dto = {
        user,
      };

      this.send<IServerDtoAuthMe>(action, dto, null);
    });
  }
}
