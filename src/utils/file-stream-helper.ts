import { Readable } from 'stream';
import archiver from 'archiver';
import { StreamableFile } from '@nestjs/common';
import { tmpdir } from 'os';
import { createReadStream, createWriteStream } from 'fs';

export interface ZipData {
  fileStream: Readable;
  fileName: string;
}

interface ZipStreamResult {
  size: number;
  location: string;
}

export class FileStreamHelper {
  static streamZip(zipDataArr: ZipData[], zipFileName = 'bundled') {
    const archive = archiver('zip');
    // using the StreamableFile class that nestjs provides
    const streamableFile = new StreamableFile(archive, {
      type: 'application/zip',
      disposition: `attachment; filename="${zipFileName}.zip`,
    });

    zipDataArr.forEach(({ fileName, fileStream }) =>
      archive.append(fileStream, { name: fileName }),
    );

    archive.on('end', () => {
      console.log('archive size: ' + archive.pointer());
    });
    archive.on('error', (err) => {
      console.error('error from archiver', err);
    });

    archive.finalize();
    return streamableFile;
  }

  static streamZipToTemp(zipDataArr: ZipData[]): Promise<ZipStreamResult> {
    return new Promise((resolve, reject) => {
      const tmpDir = tmpdir();
      const location = `${tmpDir}/${Date.now()}.zip`;
      // write the zip stream to the tempdir to get the final size
      const destStream = createWriteStream(location);
      const archive = archiver('zip');

      archive.pipe(destStream);

      zipDataArr.forEach(({ fileName, fileStream }) =>
        archive.append(fileStream, { name: fileName }),
      );

      archive.on('end', () => {
        const result: ZipStreamResult = {
          location: location,
          size: archive.pointer(),
        };
        resolve(result);
      });
      archive.on('error', (err) => {
        console.error('error from archiver', err);
        reject(err);
      });

      archive.finalize();
    });
  }

  static async streamZipWithContentLength(
    zipDataArr: ZipData[],
    zipFileName = 'bundled',
  ) {
    const { location, size } = await this.streamZipToTemp(zipDataArr);
    const locationReadStream = createReadStream(location);
    const streamableFile = new StreamableFile(locationReadStream, {
      type: 'application/zip',
      disposition: `attachment; filename="${zipFileName}.zip"`,
      length: size,
    });
    return streamableFile;
  }
}
