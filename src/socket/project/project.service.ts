import { Socket } from 'socket.io';
import { SocketService } from '../../services/SocketService';
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
  constructor(readonly socket: Socket) {
    super(socket);
  }

  protected bindListeners() {
    this.listen<IClientDtoProjectCreate>(
      ESocketAction.ProjectCreate,
      new CreateProjectDtoValidator(),
      true,
      async (packet, action) => {
        const newProject = await entities.project.create({
          ...packet.data,
          slug: packet.data,
        });

        if (newProject) {
          this.send<IServerDtoProjectCreate>(
            action,
            {
              item: entities.project.makeSharedEntity(newProject),
            },
            null,
          );
        } else {
          this.send<IServerDtoAuthRegister>(
            action,
            null,
            ESocketError.BadRequest,
            EProjectErrorMessages.TestError, //todo: Fake error only for tests!!!
          );
        }
      },
    );
  }
}
