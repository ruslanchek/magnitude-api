import { model, Schema, Document } from 'mongoose';
import { IEntityProjectShared } from '@ruslanchek/magnitude-shared';
import { logger } from '../helpers/logger';

interface IEntityProjectServer {
  id: string;
}

export type TProjectModel = IEntityProjectServer & Document;

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, unique: false },
    slug: { type: String, required: true, unique: false },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

export const ModelProject = model<TProjectModel>('Project', ProjectSchema);

export async function getProjectById(
  id: string,
  select?: Array<keyof IEntityProjectServer>,
): Promise<TProjectModel | undefined> {
  try {
    return await ModelProject.findOne(
      {
        _id: id,
      },
      select,
    );
  } catch (e) {
    logger.log('error', e.message);
  }
}

export function formSharedProjectObject(project: TProjectModel): IEntityProjectShared {
  const filteredProject = project.toObject();

  filteredProject.id = filteredProject._id;

  delete filteredProject.passwordHash;
  delete filteredProject._id;
  delete filteredProject.updatedAt;
  delete filteredProject.createdAt;
  delete filteredProject.__v;

  return filteredProject;
}
