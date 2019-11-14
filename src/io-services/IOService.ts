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

export abstract class IOService {
  constructor(readonly socket: Socket) {
    this.bindListeners();
  }

  protected abstract bindListeners(): void;

  protected formPacket<T>(
    data: T | null,
    errorCode: ESocketError | null,
    errorMessage?: string,
    errorFields?: ISocketServerErrorField[],
  ): ISocketServerPacket<T> {
    return {
      data,
      error:
        errorCode >= 0
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
