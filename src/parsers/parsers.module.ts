import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PdfParserController } from './pdf-parser/pdf-parser.controller';
import { PdfParserService } from './pdf-parser/pdf-parser.service';

@Module({
  imports: [HttpModule],
  controllers: [PdfParserController],
  providers: [PdfParserService],
})
export class ParsersModule {}
