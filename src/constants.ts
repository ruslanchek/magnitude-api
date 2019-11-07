import {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
  POSTGRES_SYNCHRONIZE,
  POSTGRES_SSL,
  JWT_SECRET,
} from './env';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const jwtConstants = {
  secret: JWT_SECRET,
  expiresIn: '30d',
};

export const authConstants = {
  // Password reset code will expire after that time
  passwordResetExpires: 1000 * 60 * 2,

  // User can request reset code again after that time
  passwordResetInterval: 1000 * 60 * 2,
};

export const typeOrmConstants: TypeOrmModuleOptions = {
  type: 'postgres',
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  username: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: POSTGRES_SYNCHRONIZE,
  ssl: POSTGRES_SSL,
};
