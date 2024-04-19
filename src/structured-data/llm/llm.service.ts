import {
  LLMApiKeyInvalidError,
  LLMApiKeyMissingError,
  LLMBadRequestReceivedError,
  LLMNotAvailableError,
  PromptTemplateFormatError,
} from './exceptions/exceptions';

import { BaseLanguageModel } from 'langchain/dist/base_language';
import { ChainValues } from 'langchain/dist/schema';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConfigService } from '@nestjs/config';
import { DebugCallbackHandler } from './callbackHandlers/debugHandler';
import { Injectable } from '@nestjs/common';
import { LLMChain } from 'langchain/chains';
import { Model } from './types/types';
import { PromptTemplate } from 'langchain/prompts';

// import { ISOLogger } from '@/logger/isoLogger.service';

@Injectable()
export class LlmService {
  constructor(private configService: ConfigService) {}
  async generateOutput(
    model: Model,
    promptTemplate: PromptTemplate,
    chainValues: ChainValues,
    debug = false,
  ) {
    const llm = this.retrieveAvailableModel(model);
    // this.logger.debug(
    //   `Using model ${model.name} ${model.apiKey ? 'with' : 'without'} API key`,
    // );

    // Check if the prompt template matches the input variables
    try {
      await promptTemplate.format(chainValues);
    } catch (e) {
      //   this.logger.error("Prompt template doesn't match input variables");
      throw new PromptTemplateFormatError();
    }

    // Create a new LLMChain instance with the given LLM and prompt template
    const llmChain = new LLMChain({
      llm,
      prompt: promptTemplate,
    });

    console.log('llmChain', llmChain);

    // Call the LLMChain instance with the given chain values and the given debug handler function
    try {
      const handler = new DebugCallbackHandler();
      const output = await llmChain.call(chainValues, debug ? [handler] : []);

      console.log('simple output', output);
      //   this.logger.debug(`generateOutput completed successfully`);

      return { output, debugReport: debug ? handler.debugReport : null };
    } catch (e) {
      if (e?.response?.status && e?.response?.status === 401) {
        // this.logger.warn('LLMApiKeyInvalidError thrown');
        throw new LLMApiKeyInvalidError(model.name);
      }
      if (e?.response?.status && e?.response?.status === 400) {
        // this.logger.warn('LLMBadRequestReceivedError thrown');
        throw new LLMBadRequestReceivedError(model.name);
      }
      //   this.logger.warn('Undefined error thrown');
      throw e;
    }
  }

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
        // creating a new model for the current language model and adding the necessary parameters using ChatOpenAPI API from langchain
        const llm = new ChatOpenAI({
          maxConcurrency: 10,
          maxRetries: 3,
          modelName: model.name,
          openAIApiKey: model.apiKey,
          temperature: 0,
        });
        return llm;
      }
      default: {
        // this.logger.warn(`Model ${model.name} was not found`);
        throw new LLMNotAvailableError(model.name);
      }
    }
  }
}
