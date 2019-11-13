import { connect, Mongoose } from 'mongoose';
import { MONGO_URL } from './env';

let connection: Mongoose = null;

export async function getConnection(): Promise<Mongoose> {
  if (!connection) {
    connection = await connect(MONGO_URL, {
      useNewUrlParser: true,
      autoReconnect: true,
      reconnectInterval: 3000,
      reconnectTries: Infinity,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  }

  return connection;
}
