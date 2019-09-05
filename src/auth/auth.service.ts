import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IJwtSignPayload } from './jwt.strategy';
import { IRegisterRequestDto, ILoginResultDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { authConstants } from '../constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<IJwtSignPayload | undefined> {
    const user = await this.usersService.findByEmail(email, [
      'email',
      'passwordHash',
    ]);

    if (user && bcrypt.compareSync(password, user.passwordHash)) {
      return {
        userId: user.id,
      };
    }

    return undefined;
  }

  async register(
    dto: IRegisterRequestDto,
  ): Promise<ILoginResultDto | undefined> {
    const passwordHash = bcrypt.hashSync(dto.password, bcrypt.genSaltSync(10));
    const user = await this.usersService.add(dto.email, passwordHash);

    if (user) {
      return this.signUser({
        userId: user.id,
      });
    } else {
      throw new BadRequestException();
    }
  }

  signUser(user: IJwtSignPayload): ILoginResultDto {
    const payload: IJwtSignPayload = {
      userId: user.userId,
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  async requestPasswordReset(email: string) {
    const passwordResetCode = bcrypt.hashSync(
      `${Date.now().toString()}${email}`,
      bcrypt.genSaltSync(10),
    );

    const user = await this.usersService.findByEmail(email);

    if (user) {
      await this.usersService.update(user.id, {
        passwordResetCode,
        passwordResetExpires: new Date(
          Date.now() + authConstants.passwordResetExpires,
        ),
      });
    } else {
      throw new NotFoundException();
    }
  }
}