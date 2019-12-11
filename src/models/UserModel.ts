import { model, Schema, Document } from 'mongoose';
import { IEntityUserShared } from '@ruslanchek/magnitude-shared';
import { logger } from '../helpers/logger';

interface IEntityUserServer {
  id: string;
  email: string;
  passwordHash: string;
}

export type TUserModel = IEntityUserServer & Document;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    projectsOwnedOf: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    projectsInvitedTo: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

export const ModelUser = model<TUserModel>('User', UserSchema);

export async function getUserById(
  id: string,
  select?: Array<keyof IEntityUserServer>,
): Promise<TUserModel | undefined> {
  try {
    return await ModelUser.findOne(
      {
        _id: id,
      },
      select,
    );
  } catch (e) {
    logger.log('error', e.message);
  }
}

export async function getUserByEmail(
  email: string,
  select?: Array<keyof IEntityUserServer>,
): Promise<TUserModel | undefined> {
  try {
    return await ModelUser.findOne(
      {
        email,
      },
      select,
    );
  } catch (e) {
    logger.log('error', e.message);
  }
}

export function formSharedUserObject(user: TUserModel): IEntityUserShared {
  const filteredUser = user.toObject();

  filteredUser.id = filteredUser._id;

  delete filteredUser.passwordHash;
  delete filteredUser._id;
  delete filteredUser.updatedAt;
  delete filteredUser.createdAt;
  delete filteredUser.__v;

  return filteredUser;
}
