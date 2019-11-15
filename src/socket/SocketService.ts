import { Socket } from 'socket.io';
import {
  ISocketClientPacket,
  ESocketAction,
  ISocketServerPacket,
  ISocketServerErrorField,
  ESocketError,
  IEntityUser,
} from '@ruslanchek/magnitude-shared';
import { logger } from '../helpers/logger';
import jsonwebtoken from 'jsonwebtoken';
import { JWT_SECRET } from '../env';
import { getUserById } from '../models/UserModel';

export interface IJwtPayload {
  userId: string;
}

export abstract class SocketService {
  constructor(readonly socket: Socket) {
    this.bindListeners();
  }

  protected abstract bindListeners(): void;

  protected listen<ClientDto>(
    action: ESocketAction,
    secure: boolean,
    callback: (packet: ISocketClientPacket<ClientDto>, answerActionName: string) => Promise<void> | void,
  ) {
    this.socket.on(action, async (packet: ISocketClientPacket<ClientDto>) => {
      const answerActionName = this.getActionName(action, packet);

      if (packet && packet.data) {
        try {
          if (secure) {
            const authorized = this.authorizePacket(packet);

            if (authorized) {
              await callback(packet, answerActionName);
            }
          } else {
            await callback(packet, answerActionName);
          }
        } catch (e) {
          logger.log('error', e.message);
          this.socket.emit(answerActionName, this.formPacket(null, ESocketError.ServerError));
        }
      } else {
        this.socket.emit(answerActionName, this.formPacket(null, ESocketError.EmptyPacket));
      }
    });
  }

  protected formPacket<ServerDto>(
    data: ServerDto | null,
    errorCode: ESocketError | null,
    errorMessage?: string,
    errorFields?: ISocketServerErrorField[],
  ): ISocketServerPacket<ServerDto> {
    return {
      data,
      error: errorCode
        ? {
            code: errorCode,
            message: errorMessage,
            fields: errorFields,
          }
        : null,
    };
  }

  protected getActionName(action: ESocketAction | string, packet: ISocketClientPacket<any>): string {
    if (packet && packet.ns) {
      action = `${action}_${packet.ns}`;
    }

    return action;
  }

  protected async authorizePacket(packet: ISocketClientPacket<any>): Promise<IEntityUser | null> {
    let result = null;

    if (packet && packet.token) {
      try {
        const jwtPayload = jsonwebtoken.verify(packet.token, JWT_SECRET) as IJwtPayload;

        if (jwtPayload && jwtPayload.userId) {
          const user = getUserById(result.userId);

          if (user) {
            return user;
          }
        }
      } catch (e) {
        logger.log('error', e.message);
      }
    }

    if (result === null) {
      this.socket.emit(
        this.getActionName(ESocketAction.AuthAuthorize, packet),
        this.formPacket(null, ESocketError.InvalidToken),
      );
      this.socket.disconnect();
    }

    return result;
  }
}
