import { Module } from '@nestjs/common';
import { ServiceController } from './service.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [ServiceController],
})
export class ServiceModule {}
