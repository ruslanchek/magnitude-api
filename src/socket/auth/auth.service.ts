import { Server, Socket } from 'socket.io';
import { ESubscriptionsRange, IJwtPayload, SocketService } from '../../services/SocketService';
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
} from '@ruslanchek/magnitude-shared';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from '../../env';
import { EAuthErrorMessages } from './auth.messages';
import { AuthLoginDtoValidator, AuthRegisterDtoValidator } from './auth.validators';
import { entities } from '../../helpers/db';
import { logger } from '../../helpers/logger';

export class SocketAuthService extends SocketService {
  constructor(readonly socket: Socket, readonly io: Server) {
    super(socket, io);
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
      this.send<IServerDtoAuthAuthorize>(action, {}, null, null);

      if (user) {
        this.socket.join(this.getUserRoomId(user.id), async err => {
          if (err) {
            logger.log('error', err);
          }

          await this.sendSubscriptionData(user.id, ESubscriptionsRange.Session);
        });
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
            null,
          );
        } else {
          this.send<IServerDtoAuthLogin>(
            action,
            null,
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

          this.send<IServerDtoAuthRegister>(action, dto, null, null);
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
        null,
      );
    });
  }
}
