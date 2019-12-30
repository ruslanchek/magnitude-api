import { Document, Schema } from 'mongoose';
import { logger } from '../helpers/logger';
import { Entity } from './Entity';
import { IEntityShared } from '@ruslanchek/magnitude-shared';

interface IEntityStoryServer {
  id: string;
  email: string;
  passwordHash: string;
}

export type TEntityStoryDocument = IEntityStoryServer & Document;

export class UserEntity extends Entity<IEntityStoryServer, TEntityStoryDocument, IEntityShared> {
  protected readonly schema = new Schema(
    {},
    {
      timestamps: this.defaultSchemaTimestamps,
    },
  );

  protected readonly model = this.connection.model<IEntityStoryServer & Document>('User', this.schema);

  makeSharedEntity(document: IEntityStoryServer & Document): IEntityShared {
    const shared = document.toObject();

    shared.id = shared._id;

    delete shared._id;
    delete shared.updatedAt;
    delete shared.createdAt;
    delete shared.__v;

    return shared;
  }
}
