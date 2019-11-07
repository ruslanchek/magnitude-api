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
    type: 'text',
    select: false,
    nullable: true,
  })
  passwordResetCode!: string;

  @Column({
    type: 'timestamp',
    select: false,
    nullable: true,
  })
  passwordChangedDate!: Date;

  @Column({
    type: 'timestamp',
    select: false,
    nullable: true,
  })
  passwordResetCodeExpires!: Date;

  @Column({
    type: 'timestamp',
    select: false,
    nullable: true,
  })
  passwordResetInterval!: Date;

  @Column({
    type: 'timestamp',
    select: false,
    nullable: true,
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
