import { Test, TestingModule } from '@nestjs/testing';

import { ConfigModule } from '@nestjs/config';
import { PdfParserController } from './pdf-parser.controller';
import { PdfParserService } from './pdf-parser.service';

describe('PdfParserController', () => {
  let controller: PdfParserController;
  let service: PdfParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfParserController],
      providers: [PdfParserService],
      imports: [ConfigModule.forRoot()],
    }).compile();

    controller = module.get<PdfParserController>(PdfParserController);
    service = module.get<PdfParserService>(PdfParserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
