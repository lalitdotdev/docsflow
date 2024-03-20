import { BadRequestException, Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import Poppler from 'node-poppler';

@Injectable()
export class PdfParserService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}
  async parsePdf(file: Buffer) {
    const poppler = new Poppler(this.configService.get('POPPLER_BIN_PATH'));

    let text = await poppler.pdfToText(file, null, {
      maintainLayout: true,
      quiet: true,
    });
    if (typeof text === 'string') {
      text = this.postProcessText(text);
    }
    return text;
  }
  private postProcessText(text: string) {
    const processedText = text
      .split('\n')
      //trim each line
      .map((line) => line.trim())
      //keep only one line if multiple lines are empty
      .filter((line, index, arr) => line !== '' || arr[index - 1] !== '')
      //remove whitespace in lines if there are more than 3 spaces
      .map((line) => line.replace(/\s{3,}/g, '   '))
      .join('\n');

    return processedText;
  }

  async loadPdfFromUrl(url: string) {
    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    });
    if (!response.headers['content-type'].includes('application/pdf')) {
      throw new Error('The given URL does not point to a PDF file');
    }

    if (
      parseInt(response.headers['content-length'] as string, 10) >
      5 * 1024 * 1024
    ) {
      throw new BadRequestException('The given PDF file is too large. Max 5MB');
    }
    return Buffer.from(response.data, 'binary');
  }
}
