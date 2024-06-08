import {
  jsonOneShotExtraction,
  jsonZeroShotSchemaExtraction,
  jsonZeroShotSchemaExtractionRefine,
} from './prompts';

// import { ISOLogger } from '@/logger/isoLogger.service';
import { Injectable } from '@nestjs/common';
import { InvalidJsonOutputError } from './exceptions/exceptions';
import { LLMService } from '../llm/llm.service';
import { Model } from '../llm/types/types';
// import { PromptTemplate } from 'langchain/prompts';
import { RefineParams } from './types/types';

@Injectable()
export class JsonService {
  private defaultRefineParams: RefineParams = {
    chunkSize: 2000,
    overlap: 100,
  };

  constructor(
    private llmService: LLMService,
    // private logger: ISOLogger,
  ) {
    // this.logger.setContext(JsonService.name);
  }

  async extractWithSchema(
    model: Model,
    text: string,
    schema: string,
    debug = false,
  ) {
    const { output, debugReport } = await this.llmService.generateOutput(
      model,
      jsonZeroShotSchemaExtraction,
      {
        context: text,
        jsonSchema: schema,
      },
      debug,
    );
    try {
      const json: object = JSON.parse(output.text);
      //   this.logger.debug('extractWithSchema: json parsed successfully');
      return { json, debugReport };
    } catch (e) {
      //   this.logger.warn('extractWithSchema: json parsing failed');
      throw new InvalidJsonOutputError();
    }
  }
}
