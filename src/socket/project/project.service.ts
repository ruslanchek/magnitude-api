import { Server, Socket } from 'socket.io';
import { ESubscriptionsRange, SocketService } from '../../services/SocketService';
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

        const item = entities.project.makeSharedEntity(newProject);

        this.send<IServerDtoProjectCreate>(
          action,
          {
            item,
          },
          null,
          null,
        );

        this.send<IServerDtoGetOwnProjects>(
          ESocketAction.ProjectGetOwnProjects,
          {
            list: [item],
            incremental: true,
          },
          this.getRoomId(user.id, ESubscriptionsRange.User),
          null,
        );
      },
    );
  }
}
