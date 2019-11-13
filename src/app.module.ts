import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { ServiceModule } from './service/service.module';
import { SocketModule } from './socket/socket.module';
import { typeOrmConstants } from './constants';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConstants), SocketModule, AuthModule, UserModule, EmailModule, ServiceModule],
  providers: [EmailService],
})
export class AppModule {}
