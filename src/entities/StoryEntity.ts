import { Document, Schema } from 'mongoose';
import { logger } from '../helpers/logger';
import { Entity } from './Entity';
import { IEntityStoryShared } from '@ruslanchek/magnitude-shared';

interface IEntityStoryServer {
  id: string;
  title: string;
}

export type TEntityStoryDocument = IEntityStoryServer & Document;

export class UserEntity extends Entity<IEntityStoryServer, TEntityStoryDocument, IEntityStoryShared> {
  protected readonly schema = new Schema(
    {
      title: Schema.Types.String,
    },
    {
      timestamps: this.defaultSchemaTimestamps,
    },
  );

  protected readonly model = this.connection.model<IEntityStoryServer & Document>('User', this.schema);

  makeSharedEntity(document: IEntityStoryServer & Document): IEntityStoryShared {
    const shared = document.toObject();

    shared.id = shared._id;

    delete shared._id;
    delete shared.updatedAt;
    delete shared.createdAt;
    delete shared.__v;

    return shared;
  }
}
