import { Controller, Get } from '@nestjs/common';

@Controller('service')
export class ServiceController {
  @Get('health-check')
  register() {
    return {
      status: 'OK',
    };
  }
}
