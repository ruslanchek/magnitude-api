import { IsNotEmpty } from 'class-validator';
import { IClientDtoProjectCreate } from '@ruslanchek/magnitude-shared';
import { EAuthDataErrorMessages } from '../auth/auth.messages';

export class CreateProjectDtoValidator implements IClientDtoProjectCreate {
  @IsNotEmpty({
    message: EAuthDataErrorMessages.EmptyPassword,
  })
  title!: string;
}
