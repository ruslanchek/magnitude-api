import { Document, Schema } from 'mongoose';
import { logger } from '../helpers/logger';
import { Entity } from './Entity';
import { IEntityUserShared } from '@ruslanchek/magnitude-shared';

interface IEntityUserServer {
  id: string;
  email: string;
  passwordHash: string;
}

export type TEntityUserDocument = IEntityUserServer & Document;

export class UserEntity extends Entity<IEntityUserServer, TEntityUserDocument, IEntityUserShared> {
  protected readonly schema = new Schema(
    {
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true, select: false },
      projectsOwnedOf: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
      projectsInvitedTo: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    },
    {
      timestamps: this.defaultSchemaTimestamps,
    },
  );

  protected readonly model = this.connection.model<IEntityUserServer & Document>('User', this.schema);

  makeSharedEntity(document: IEntityUserServer & Document): IEntityUserShared {
    const shared = document.toObject();

    shared.id = shared._id;

    delete shared.passwordHash;
    delete shared._id;
    delete shared.updatedAt;
    delete shared.createdAt;
    delete shared.__v;

    return shared;
  }

  public async getUserById(id: string, select?: Array<keyof IEntityUserServer>): Promise<TEntityUserDocument | null> {
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

  public async getUserByEmail(
    email: string,
    select?: Array<keyof IEntityUserServer>,
  ): Promise<TEntityUserDocument | null> {
    try {
      return await this.model.findOne(
        {
          email,
        },
        select,
      );
    } catch (e) {
      logger.log('error', e.message);
    }
    return null;
  }

  public async create(data: Partial<IEntityUserServer>): Promise<TEntityUserDocument | null> {
    try {
      const newUser = new this.model(data);
      return await newUser.save();
    } catch (e) {
      logger.log('error', e.message);
    }

    return null;
  }
}
