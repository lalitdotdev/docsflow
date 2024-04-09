import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  ParseFilePipeBuilder,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PdfParserService } from './pdf-parser.service';
import {
  PdfParserUploadResultDto,
  PdfParserUrlResultDto,
} from './dto/pdf-parser-result.dto';
import { PdfParserRequestDto } from './dto/pdf-parser-request.dto';
import { PdfNotParsedError } from './exceptions/exceptions';

const uploadSchema = {
  type: 'object',
  properties: {
    file: {
      type: 'string',
      format: 'binary',
    },
  },
};

const pdfPipe = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: 'pdf',
  })
  .addMaxSizeValidator({
    maxSize: 1024 * 1024 * 5, // 5mb
  })
  .build({
    fileIsRequired: true,
  });

// check for unauthorised response
@ApiUnauthorizedResponse({
  description: 'API Key in request header is invalid or missing',
})
@ApiBadRequestResponse({
  description: 'The request body or the uploaded file is invalid or missing',
})
@ApiUnprocessableEntityResponse({
  description:
    'The PDF file could not be parsed or the content could not be extracted from the given URL',
})
@ApiSecurity('apiKey')
@ApiTags('parsers')
@Controller({ path: 'parsers/pdf', version: '1' })
export class PdfParserController {
  constructor(private readonly pdfParserService: PdfParserService) {}

  @ApiOperation({
    summary: 'Return text from uploaded PDF file',
    description: `This endpoint retrieves the content of an uploaded PDF file and returns it as a text.\n
    The file must be a PDF parsable text context, with a maximum size of 5MB.
   `,
  })
  @ApiOkResponse({
    type: PdfParserUploadResultDto,
    description:
      'The PDF was parsed and post-processed successfully. Its content is returned as text.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: uploadSchema, description: 'PDF file to be parsed' })
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  @HttpCode(200)
  async parsePdfFromUpload(
    @UploadedFile(pdfPipe) file: Express.Multer.File,
  ): Promise<PdfParserUploadResultDto> {
    try {
      const text = await this.pdfParserService.parsePdf(file.buffer);
      return {
        originalFileName: file.originalname,
        content: text,
      };
    } catch (e) {
      throw new UnprocessableEntityException(e.message);
    }
  }
  @ApiOperation({
    summary: 'Return text from PDF file provided by URL',
    description: `This endpoint retrieves the content of an PDF file available through an URL and returns it as a text.\n
    The file must be a PDF parsable text context, with a maximum size of 5MB`,
  })
  @ApiOkResponse({
    type: PdfParserUploadResultDto,
    description:
      'The PDF was parsed and post-processed successfully. Its content is returned as text.',
  })
  @Post('url')
  @HttpCode(200)
  @Post('url')
  async parsePdfFromUrl(
    @Body() requestDto: PdfParserRequestDto,
  ): Promise<PdfParserUrlResultDto> {
    try {
    } catch (e) {
      if (e instanceof PdfNotParsedError) {
        throw new UnprocessableEntityException(e.message);
      }
      throw new BadRequestException(e.message);
    }
    const file = await this.pdfParserService.loadPdfFromUrl(requestDto.url);
    const text = await this.pdfParserService.parsePdf(file);

    if (typeof text !== 'string' || text.length === 0) {
      throw new UnprocessableEntityException('Could not parse given PDF file');
    }

    return {
      originalUrl: requestDto.url,
      content: text,
    };
  }
}
