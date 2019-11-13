import { model, Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

export const User = model<IUser>('User', UserSchema);
