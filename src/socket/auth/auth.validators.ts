import { IsEmail, IsNotEmpty, validate } from 'class-validator';
import { EAuthErrorMessages } from './auth.messages';
import { IClientDtoAuthRegister, IClientDtoAuthLogin } from '@ruslanchek/magnitude-shared';

export class AuthLoginDtoValidator implements IClientDtoAuthLogin {
  @IsEmail(undefined, {
    message: EAuthErrorMessages.NotEmail,
  })
  email: string;

  @IsNotEmpty({
    message: EAuthErrorMessages.EmptyPassword,
  })
  password: string;
}

export class AuthRegisterDtoValidator implements IClientDtoAuthRegister {
  @IsEmail(undefined, {
    message: EAuthErrorMessages.NotEmail,
  })
  email: string;

  @IsNotEmpty({
    message: EAuthErrorMessages.EmptyPassword,
  })
  password: string;
}
