import { Socket } from 'socket.io';
import { SocketService } from '../../services/SocketService';
import {
  ESocketAction,
  ESocketError,
  IClientDtoProjectCreate,
  IServerDtoAuthRegister,
  IServerDtoGetOwnProjects,
  IServerDtoProjectCreate,
} from '@ruslanchek/magnitude-shared';
import { entities } from '../../helpers/db';
import { EProjectErrorMessages } from './project.messages';
import { CreateProjectDtoValidator } from './project.validators';

export class SocketProjectService extends SocketService {
  constructor(readonly socket: Socket) {
    super(socket);
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
        );

        await this.sendSubscriptionDataOwnProjects(user.id);
      },
    );
  }
}
