import { Socket } from 'socket.io';
import {
  ISocketClientPacket,
  ESocketAction,
  ISocketServerPacket,
  ISocketServerErrorField,
  ESocketError,
} from '@ruslanchek/magnitude-shared';
import { logger } from '../helpers/logger';
import jsonwebtoken from 'jsonwebtoken';
import { JWT_SECRET } from '../env';
import { getUserById, TUserModel } from '../models/UserModel';
import { validate } from 'class-validator';

export interface IJwtPayload {
  userId: string;
}

export abstract class SocketService {
  constructor(readonly socket: Socket) {
    this.bindListeners();
  }

  protected abstract bindListeners(): void;

  protected send<ServerDto>(
    action: ESocketAction | string,
    data: ServerDto | null,
    errorCode: ESocketError | null,
    errorMessage?: string,
    errorFields?: ISocketServerErrorField[],
  ) {
    const packet: ISocketServerPacket<ServerDto> = {
      data,
      error: errorCode
        ? {
            code: errorCode,
            message: errorMessage,
            fields: errorFields,
          }
        : null,
    };

    this.socket.emit(action, packet);
  }

  protected listen<ClientDto>(
    action: ESocketAction,
    dtoValidatorInstance: ClientDto,
    secure: boolean,
    callback: (
      packet: ISocketClientPacket<ClientDto>,
      answerActionName: string,
      user: TUserModel | null,
    ) => Promise<void> | void,
  ) {
    // Binding a listener for action
    this.socket.on(action, async (packet: ISocketClientPacket<ClientDto>) => {
      // Constructing an answer action name (because it depends on ns property from the packet)
      const answerActionName = this.getActionName(action, packet);

      // Trying to determine if packet exists
      if (packet && packet.data) {
        try {
          // If validator passed, trying to validate data
          if (dtoValidatorInstance) {
            for (const key in packet.data) {
              if (packet.data.hasOwnProperty(key)) {
                dtoValidatorInstance[key] = packet.data[key];
              }
            }

            const result = await validate(dtoValidatorInstance);

            if (result && result.length > 0) {
              return this.send(answerActionName, null, ESocketError.InvalidData);
            }
          }

          // If action listener marked as secure, trying to authorize
          if (secure) {
            const user = await this.authorizePacket(packet);

            // If autorized successfuly, callback then
            if (user) {
              await callback(packet, answerActionName, user);
            } else {
              // If not autorized, emit invalid token error and disconnect
              this.send(answerActionName, null, ESocketError.InvalidToken);
              this.socket.disconnect();
            }
          } else {
            // If action can be unautherized (e.g. login), just callback then
            await callback(packet, answerActionName, null);
          }
        } catch (e) {
          // If something wrong, answer with a server error
          logger.log('error', e.message);
          this.send(answerActionName, null, ESocketError.ServerError);
        }
      } else {
        // If packet is empty, answer with an empty packed error
        this.send(answerActionName, null, ESocketError.EmptyPacket);
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

  private async authorizePacket(packet: ISocketClientPacket<any>): Promise<TUserModel | null> {
    let result = null;

    if (packet && packet.token) {
      try {
        const jwtPayload = jsonwebtoken.verify(packet.token, JWT_SECRET) as IJwtPayload;

        if (jwtPayload && jwtPayload.userId) {
          const user = getUserById(jwtPayload.userId);

          if (user) {
            return user;
          }
        }
      } catch (e) {
        logger.log('error', e.message);
      }
    }

    return result;
  }
}
