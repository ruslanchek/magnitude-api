import { connect, Mongoose } from 'mongoose';
import { UserEntity } from '../entities/UserEntity';
import { MONGO_URL } from '../env';
import { logger } from './logger';
import { ProjectEntity } from '../entities/ProjectEntity';

interface IEntities {
  user: UserEntity;
  project: ProjectEntity;
}

export let entities: IEntities;
let connection: Mongoose;

export async function getDbConnection(): Promise<Mongoose> {
  if (!connection) {
    connection = await connect(MONGO_URL, {
      useNewUrlParser: true,
      autoReconnect: false,
      useUnifiedTopology: true,
      useCreateIndex: true,
      autoIndex: true,
    });

    entities = {
      user: new UserEntity(connection),
      project: new ProjectEntity(connection),
    };

    logger.log('info', 'DB connected', 'DB');
  }

  return connection;
}
