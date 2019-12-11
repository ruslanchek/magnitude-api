import { connect, Mongoose } from 'mongoose';
import { UserEntity } from '../models/UserEntity';
import { MONGO_URL } from '../env';
import { logger } from './logger';
import { ProjectEntity } from '../models/ProjectEntity';

interface IEntities {
  user: UserEntity;
  project: ProjectEntity;
}

export let entities: IEntities;
let connection: Mongoose;

export async function getConnection(): Promise<Mongoose> {
  if (!connection) {
    connection = await connect(MONGO_URL, {
      useNewUrlParser: true,
      autoReconnect: true,
      reconnectInterval: 3000,
      reconnectTries: Infinity,
      useUnifiedTopology: false,
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
