import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { ServiceModule } from './service/service.module';
import { EventsModule } from './events/events.module';
import { typeOrmConstants } from './constants';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConstants), EventsModule, AuthModule, UserModule, EmailModule, ServiceModule],
  providers: [EmailService],
})
export class AppModule {}
