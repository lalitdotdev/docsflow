import { Controller, Get } from '@nestjs/common';

import { ApiSecurity } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiSecurity('apikey')
@Controller({
  version: '1',
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
