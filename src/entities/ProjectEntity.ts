import { Document, Schema } from 'mongoose';
import { logger } from '../helpers/logger';
import { Entity } from './Entity';
import { IEntityProjectShared } from '@ruslanchek/magnitude-shared';

interface IEntityProjectServer {
  id: string;
  title: string;
  owner: string;
  invitees: string[];
}

export type TEntityProjectDocument = IEntityProjectServer & Document;

export class ProjectEntity extends Entity<IEntityProjectServer, TEntityProjectDocument, IEntityProjectShared> {
  protected readonly schema = new Schema(
    {
      title: { type: String, required: true },
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

  public async getById(id: string, select?: Array<keyof IEntityProjectServer>): Promise<TEntityProjectDocument | null> {
    try {
      return await this.model.findOne(
        {
          _id: id,
        },
        select,
      );
    } catch (e) {
      logger.log('error', e.message);
    }

    return null;
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
