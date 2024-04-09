import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class PdfParserRequestDto {
  @ApiProperty({
    description:
      'URL of the PDF file to be parsed and post-processed to the server',
  })
  @IsUrl()
  url: string;
}
