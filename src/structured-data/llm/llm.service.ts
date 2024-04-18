import {
  LLMApiKeyMissingError,
  LLMNotAvailableError,
} from './exceptions/exceptions';

import { BaseLanguageModel } from 'langchain/dist/base_language';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Model } from './types/types';

@Injectable()
export class LlmService {
  constructor(private configService: ConfigService) {}

  //   Retrieve the available model based on the given model name
  private retrieveAvailableModel(model: Model): BaseLanguageModel {
    switch (model.name) {
      case 'gpt-3.5-turbo':
      case 'gpt-3.5-turbo-16k':
      case 'gpt-4': {
        if (!model.apiKey) {
          //   this.logger.warn(`Missing API key for ${model.name} model`);
          throw new LLMApiKeyMissingError(model.name);
        }
      }
      default: {
        // this.logger.warn(`Model ${model.name} was not found`);
        throw new LLMNotAvailableError(model.name);
      }
    }
  }
}
