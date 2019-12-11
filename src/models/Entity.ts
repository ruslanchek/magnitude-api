import { Document, Model, Schema, Mongoose } from 'mongoose';

export abstract class Entity<TEntityServer, TEntityModel, IEntityShared> {
  constructor(protected readonly connection: Mongoose) {}

  protected readonly defaultSchemaTimestamps = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  };

  protected abstract readonly schema: Schema<TEntityServer>;
  protected abstract readonly model: Model<TEntityServer & Document>;

  public abstract makeSharedEntity(document: TEntityServer & Document): IEntityShared;
}
