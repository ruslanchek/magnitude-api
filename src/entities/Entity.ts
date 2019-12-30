import { Document, Model, Schema, Mongoose } from 'mongoose';
import { logger } from '../helpers/logger';

export abstract class Entity<TEntityServer, TEntityModel, IEntityShared> {
  constructor(protected readonly connection: Mongoose) {}

  protected readonly defaultSchemaTimestamps = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  };

  protected abstract readonly schema: Schema<TEntityServer>;
  protected abstract readonly model: Model<TEntityServer & Document>;

  public abstract makeSharedEntity(document: TEntityServer & Document): IEntityShared;

  public async getById(id: string, select?: Array<keyof TEntityServer>): Promise<(TEntityServer & Document) | null> {
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

  public async create(data: Partial<TEntityServer>): Promise<(TEntityServer & Document) | null> {
    try {
      const newItem = new this.model(data);
      return await newItem.save();
    } catch (e) {
      logger.log('error', e.message);
    }

    return null;
  }
}
