import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

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

@ApiSecurity('apiKey')
@ApiTags('parsers')
@Controller({ path: 'parsers/pdf', version: '1' })
export class PdfParserController {
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: uploadSchema,
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  parsePdfFromUpload(@UploadedFile(pdfPipe) file: Express.Multer.File) {
    return { file };
  }
}
