import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email!: string;

  @Column({
    type: 'text',
    select: false,
  })
  passwordHash!: string;

  @Column({
    type: 'timestamp',
    select: false,
  })
  passwordChangedDate!: Date;

  @Column({
    type: 'timestamp',
    select: false,
  })
  passwordResetCodeExpires!: Date;

  @Column({
    type: 'timestamp',
    select: false,
  })
  passwordResetInterval!: Date;

  @Column({
    type: 'text',
    select: false,
    nullable: true,
  })
  passwordResetCode!: string;

  @Column({
    type: 'timestamp',
    select: false,
  })
  emailConfirmationCodeDate!: Date;

  @Column({
    type: 'text',
    select: false,
    nullable: true,
  })
  emailConfirmationCode!: string;

  @Column({
    type: 'boolean',
    select: false,
    default: false,
  })
  isEmailConfirmed!: boolean;
}
