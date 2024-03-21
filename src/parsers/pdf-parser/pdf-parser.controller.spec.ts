import { Test, TestingModule } from '@nestjs/testing';

import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PdfParserController } from './pdf-parser.controller';
import { PdfParserService } from './pdf-parser.service';

describe('PdfParserController', () => {
  let controller: PdfParserController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: PdfParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfParserController],
      providers: [PdfParserService],
      imports: [ConfigModule.forRoot(), HttpModule],
    }).compile();

    controller = module.get<PdfParserController>(PdfParserController);
    service = module.get<PdfParserService>(PdfParserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
