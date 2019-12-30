import { Document, Schema } from 'mongoose';
import { logger } from '../helpers/logger';
import { Entity } from './Entity';
import { IEntityProjectShared } from '@ruslanchek/magnitude-shared';

interface IEntityProjectServer {
  id: string;
  title: string;
  owner: string;
  invitees: string[];
  updatedAt: Date;
  createdAt: Date;
}

export type TEntityProjectDocument = IEntityProjectServer & Document;

export class ProjectEntity extends Entity<IEntityProjectServer, TEntityProjectDocument, IEntityProjectShared> {
  protected readonly schema = new Schema(
    {
      title: { type: Schema.Types.String, required: true },
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
    delete shared.__v;

    return shared;
  }

  public async checkTitleExists(userId: string, title: string): Promise<boolean | null> {
    try {
      const result = await this.model.find({
        $and: [{ title }, { owner: userId }],
      });

      return result.length <= 0;
    } catch (e) {
      logger.log('error', e.message);
    }

    return null;
  }

  public async getOwn(
    userId: string,
    select?: Array<keyof IEntityProjectServer>,
  ): Promise<TEntityProjectDocument[] | null> {
    try {
      return await this.model.find(
        {
          owner: userId,
        },
        select,
      );
    } catch (e) {
      logger.log('error', e.message);
    }

    return null;
  }
}
