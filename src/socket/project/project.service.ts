import { Socket, Server } from 'socket.io';
import { ESubscriptionsRange, SocketService } from '../../services/SocketService';
import {
  ESocketAction,
  ESocketError,
  IClientDtoProjectCreate,
  IServerDtoAuthRegister,
  IServerDtoProjectCreate,
} from '@ruslanchek/magnitude-shared';
import { entities } from '../../helpers/db';
import { EProjectErrorMessages } from './project.messages';
import { CreateProjectDtoValidator } from './project.validators';

export class SocketProjectService extends SocketService {
  constructor(readonly socket: Socket, readonly io: Server) {
    super(socket, io);
  }

  protected bindListeners() {
    this.listen<IClientDtoProjectCreate>(
      ESocketAction.ProjectCreate,
      new CreateProjectDtoValidator(),
      true,
      async (packet, action, user) => {
        if (!user) {
          return this.sendNoUserError(action);
        }

        const projectTitleExists = await entities.project.checkTitleExists(user.id, packet.data.title);

        if (projectTitleExists === false) {
          return this.send<IServerDtoAuthRegister>(
            action,
            null,
            null,
            ESocketError.BadRequest,
            EProjectErrorMessages.ProjectWithThisTitleAlreadyExists,
          );
        }

        const newProject = await entities.project.create({
          ...packet.data,
          owner: user.id,
          invitees: [],
        });

        if (!newProject) {
          throw new Error();
        }

        this.send<IServerDtoProjectCreate>(
          action,
          {
            item: entities.project.makeSharedEntity(newProject),
          },
          null,
          null,
        );

        await this.sendSubscriptionDataOwnProjects(user.id, ESubscriptionsRange.User);
      },
    );
  }
}
