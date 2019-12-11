import { Document, Schema } from 'mongoose';
import { logger } from '../helpers/logger';
import { Entity } from './Entity';
import { IEntityProjectShared } from '@ruslanchek/magnitude-shared';

interface IEntityProjectServer {
  id: string;
  title: string;
  slug: string;
}

export type TEntityProjectDocument = IEntityProjectServer & Document;

export class ProjectEntity extends Entity<IEntityProjectServer, TEntityProjectDocument, IEntityProjectShared> {
  protected readonly schema = new Schema(
    {
      title: { type: String, required: true, unique: false },
      slug: { type: String, required: true, unique: false },
      owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      invitees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    {
      timestamps: this.defaultSchemaTimestamps,
    },
  );

  protected readonly model = this.connection.model<IEntityProjectServer & Document>('Project', this.schema);

  makeSharedEntity(document: IEntityProjectServer & Document): IEntityProjectShared {
    const shared = document.toObject();

    shared.id = shared._id;

    delete shared._id;
    delete shared.updatedAt;
    delete shared.createdAt;
    delete shared.__v;

    return shared;
  }

  public async create(data: Partial<IEntityProjectServer>): Promise<TEntityProjectDocument | null> {
    try {
      const newProject = new this.model(data);
      return await newProject.save();
    } catch (e) {
      logger.log('error', e.message);
    }

    return null;
  }
}
