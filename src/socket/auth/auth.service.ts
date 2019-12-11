import { Socket } from 'socket.io';
import { IJwtPayload, SocketService } from '../../services/SocketService';
import {
  ESocketAction,
  ESocketError,
  IClientDtoAuthAuthorize,
  IClientDtoAuthLogin,
  IClientDtoAuthMe,
  IClientDtoAuthRegister,
  IServerDtoAuthAuthorize,
  IServerDtoAuthLogin,
  IServerDtoAuthMe,
  IServerDtoAuthRegister,
  IServerDtoGetOwnProjects,
} from '@ruslanchek/magnitude-shared';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from '../../env';
import { EAuthErrorMessages } from './auth.messages';
import { AuthLoginDtoValidator, AuthRegisterDtoValidator } from './auth.validators';
import { entities } from '../../helpers/db';

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
    this.listen<IClientDtoAuthAuthorize>(ESocketAction.AuthAuthorize, null, true, async (packet, action, user) => {
      this.send<IServerDtoAuthAuthorize>(action, {}, null);

      if (user) {
        await this.sendSubscriptionData(user.id);
      }
    });

    this.listen<IClientDtoAuthLogin>(
      ESocketAction.AuthLogin,
      new AuthLoginDtoValidator(),
      false,
      async (packet, action) => {
        const existingUser = await entities.user.getByEmail(packet.data.email, ['passwordHash']);

        if (existingUser && this.verifyPassword(packet.data.password, existingUser.passwordHash)) {
          this.send<IServerDtoAuthLogin>(
            action,
            {
              token: this.generateToken({
                userId: existingUser.id,
              }),
            },
            null,
          );
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
        const existingUser = await entities.user.getByEmail(packet.data.email);

        if (existingUser) {
          this.send<IServerDtoAuthRegister>(
            action,
            null,
            ESocketError.BadRequest,
            EAuthErrorMessages.UserAlreadyExists,
          );
        } else {
          const newUser = await entities.user.create({
            email: packet.data.email,
            passwordHash: this.cryptPassword(packet.data.password),
          });

          if (!newUser) {
            throw new Error();
          }

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
      if (!user) {
        return this.sendNoUserError(action);
      }

      this.send<IServerDtoAuthMe>(
        action,
        {
          user,
        },
        null,
      );
    });
  }
}
