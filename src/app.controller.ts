import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('zip-stream')
  async zipAndStream() {
    // we're going to zip the README.md and the package.json files
    const filePaths = ['../README.md', '../package.json'];
  }
}
