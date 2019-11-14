import { model, Schema, Document } from 'mongoose';
import { IEntityUser } from '@ruslanchek/magnitude-shared';
import { logger } from '../helpers/logger';

type IModelUser = IEntityUser & Document;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
});

export const ModelUser = model<IModelUser>('User', UserSchema);

export async function getUserById(id: string): Promise<IModelUser | undefined> {
  try {
    return await ModelUser.findOne({
      _id: id,
    });
  } catch (e) {
    logger.log('error', e.message);
  }
}
