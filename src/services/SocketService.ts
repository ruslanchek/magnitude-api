import { Socket } from 'socket.io';
import { logger } from '../helpers/logger';
import jsonwebtoken from 'jsonwebtoken';
import { JWT_SECRET } from '../env';
import { validate } from 'class-validator';
import { entities } from '../helpers/db';
import { TEntityUserDocument } from '../entities/UserEntity';
import {
  ESocketAction,
  ESocketError,
  IEntityUserShared,
  IServerDtoGetOwnProjects,
  ISocketClientPacket,
  ISocketServerErrorField,
  ISocketServerPacket,
} from '@ruslanchek/magnitude-shared';

export interface IJwtPayload {
  userId: string;
}

export abstract class SocketService {
  protected constructor(readonly socket: Socket) {
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

    logger.log('debug', `[${this.socket.id}] server emitted: ${action}, with data: ${JSON.stringify(packet)}`);

    this.socket.emit(action, packet);
  }

  protected sendNoUserError(answerActionName: string) {
    this.send(answerActionName, null, ESocketError.ServerError);
  }

  protected listen<ClientDto>(
    action: ESocketAction,
    dtoValidatorInstance: ClientDto | null,
    secure: boolean,
    callback: (
      packet: ISocketClientPacket<ClientDto>,
      answerActionName: string,
      user: IEntityUserShared | null,
    ) => Promise<void> | void,
  ) {
    // Binding a listener for action
    this.socket.on(action, async (packet: ISocketClientPacket<ClientDto>) => {
      // Constructing an answer action name (because it depends on ns property from the packet)
      const answerActionName = this.getActionName(action, packet);

      logger.log(
        'debug',
        `[${this.socket.id}] client requested: ${answerActionName}, with data: ${JSON.stringify(packet)}`,
      );

      // Trying to determine if packet exists
      if (packet && packet.data) {
        try {
          // If validator passed, trying to validate data
          if (dtoValidatorInstance) {
            for (const key in packet.data) {
              if (Object.hasOwnProperty.call(packet.data, key)) {
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

            // If authorized successful, callback then
            if (user) {
              await callback(packet, answerActionName, entities.user.makeSharedEntity(user));
            } else {
              // If not authorized, emit invalid token error and disconnect
              this.send(answerActionName, null, ESocketError.InvalidToken);
            }
          } else {
            // If action can be unauthorized (e.g. login), just callback then
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

  protected getActionName(action: ESocketAction | string, packet: ISocketClientPacket<any>): string {
    if (packet && packet.ns) {
      action = `${action}_${packet.ns}`;
    }

    return action;
  }

  protected async authorizePacket(packet: ISocketClientPacket<any>): Promise<TEntityUserDocument | null> {
    if (packet && packet.token) {
      try {
        const jwtPayload = jsonwebtoken.verify(packet.token, JWT_SECRET) as IJwtPayload;

        if (jwtPayload && jwtPayload.userId) {
          const user = await entities.user.getById(jwtPayload.userId);

          if (user) {
            return user;
          }
        }
      } catch (e) {
        logger.log('error', e.message);
      }
    }

    return null;
  }

  protected sendSubscriptionDataOwnProjects = async (userId: string) => {
    const ownProjects = await entities.project.getOwn(userId);

    if (ownProjects) {
      this.send<IServerDtoGetOwnProjects>(
        ESocketAction.ProjectGetOwnProjects,
        {
          list: ownProjects.map(item => entities.project.makeSharedEntity(item)),
        },
        null,
      );
    }
  };

  protected sendSubscriptionData = async (userId: string) => {
    await this.sendSubscriptionDataOwnProjects(userId);
  };
}
