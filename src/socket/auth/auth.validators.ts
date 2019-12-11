import { IsEmail, IsNotEmpty } from 'class-validator';
import { EAuthDataErrorMessages } from './auth.messages';
import { IClientDtoAuthLogin, IClientDtoAuthRegister } from '@ruslanchek/magnitude-shared';

export class AuthLoginDtoValidator implements IClientDtoAuthLogin {
  @IsEmail(undefined, {
    message: EAuthDataErrorMessages.NotEmail,
  })
  email!: string;

  @IsNotEmpty({
    message: EAuthDataErrorMessages.EmptyPassword,
  })
  password!: string;
}

export class AuthRegisterDtoValidator implements IClientDtoAuthRegister {
  @IsEmail(undefined, {
    message: EAuthDataErrorMessages.NotEmail,
  })
  email!: string;

  @IsNotEmpty({
    message: EAuthDataErrorMessages.EmptyPassword,
  })
  password!: string;
}
