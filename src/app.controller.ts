import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { createReadStream } from 'fs';
import { FileStreamHelper, ZipData } from './utils/file-stream-helper';

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
    const currDir = __dirname;
    const filePaths = [`${currDir}/../README.md`, `${currDir}/../package.json`];
    const zipDataArr: ZipData[] = filePaths.map((path) => ({
      fileStream: createReadStream(path),
      fileName: path.split('/').pop(),
    }));

    return FileStreamHelper.streamZip(zipDataArr);
  }
}
