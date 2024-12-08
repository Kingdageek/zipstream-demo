import { Readable } from 'stream';
import archiver from 'archiver';
import { StreamableFile } from '@nestjs/common';

export interface ZipData {
  fileStream: Readable;
  fileName: string;
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
}
