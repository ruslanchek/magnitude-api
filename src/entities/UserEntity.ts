import { Document, Schema } from 'mongoose';
import { logger } from '../helpers/logger';
import { Entity } from './Entity';
import { IEntityUserShared } from '@ruslanchek/magnitude-shared';

interface IEntityUserServer {
  id: string;
  email: string;
  passwordHash: string;
  projectsOwnedOf: string[];
  projectsInvitedTo: string[];
}

export type TEntityUserDocument = IEntityUserServer & Document;

export class UserEntity extends Entity<IEntityUserServer, TEntityUserDocument, IEntityUserShared> {
  protected readonly schema = new Schema(
    {
      email: { type: Schema.Types.String, required: true, unique: true },
      passwordHash: { type: Schema.Types.String, required: true, select: false },
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

  public async getByEmail(email: string, select?: Array<keyof IEntityUserServer>): Promise<TEntityUserDocument | null> {
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
}
