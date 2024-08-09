import {
  LLMApiKeyInvalidError,
  LLMApiKeyMissingError,
  LLMBadRequestReceivedError,
  LLMNotAvailableError,
  PromptTemplateFormatError,
  RefinePromptsInputVariablesError,
  RefineReservedChainValuesError,
} from './exceptions/exceptions';
import { LLMChain, loadQARefineChain } from 'langchain/chains';

import { BaseLanguageModel } from 'langchain/dist/base_language';
import { ChainValues } from 'langchain/dist/schema';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { DebugCallbackHandler } from './callbackHandlers/debugHandler';
import { Document } from 'langchain/document';
// import { ISOLogger } from '@/logger/isoLogger.service';
import { Injectable } from '@nestjs/common';
import { Model } from './types/types';
import { PromptTemplate } from 'langchain/prompts';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { RefineCallbackHandler } from './callbackHandlers/refineHandler';

@Injectable()
export class LLMService {
  constructor(private configService: ConfigService) {
    // this.logger.setContext(LLMService.name);
  }

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
      verbose: true,
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

  async generateRefineOutput(
    model: Model,
    initialPromptTemplate: PromptTemplate,
    refinePromptTemplate: PromptTemplate,
    chainValues: ChainValues & { input_documents: Document[] },
    debug: boolean = false,
  ) {
    const llm = this.retrieveAvailableModel(model);
    // this.logger.debug(
    //   `Using model ${model.name} ${model.apiKey ? 'with' : 'without'} API key`,
    // );

    if (chainValues['context'] || chainValues['existing_answer']) {
      //   this.logger.error(
      //     "Reserved chain values 'context' & 'existing_answer' can't be used",
      //   );
      throw new RefineReservedChainValuesError('context or existing_answer');
    }

    this.throwErrorIfInputVariableMissing(
      'initialPromptTemplate',
      'context',
      initialPromptTemplate.inputVariables,
    );

    this.throwErrorIfInputVariableMissing(
      'refinePromptTemplate',
      'context',
      refinePromptTemplate.inputVariables,
    );

    this.throwErrorIfInputVariableMissing(
      'refinePromptTemplate',
      'existing_answer',
      refinePromptTemplate.inputVariables,
    );
    const refineChain = loadQARefineChain(llm, {
      questionPrompt: initialPromptTemplate,
      refinePrompt: refinePromptTemplate,
    });

    try {
      const handler = new RefineCallbackHandler();
      const debugHandler = new DebugCallbackHandler();

      //   Loads a RefineQAChain based on the provided parameters. It takes an LLM instance and RefineQAChainParams as parameters.

      //   @deprecated call
      const output = await refineChain.call(
        chainValues,
        debug ? [handler, debugHandler] : [handler],
      );

      //   this.logger.debug(`generateRefineOutput completed successfully`);

      return {
        output,
        llmCallCount: handler.llmCallCount,
        debugReport: debug ? debugHandler.debugReport : null,
      };
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

  async splitDocument(
    document: string,
    params: { chunkSize: number; overlap: number },
  ) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: params.chunkSize,
      chunkOverlap: params.overlap,
    });

    const output = await splitter.createDocuments([document]);

    // this.logger.debug(
    //   `splitDocument created ${output.length} documents (chunks size: ${params.chunkSize}, overlap: ${params.overlap})`,
    // );

    return output;
  }

  private throwErrorIfInputVariableMissing(
    templateName: string,
    variableName: string,
    inputVariables: string[],
  ) {
    if (!inputVariables.includes(variableName)) {
      //   this.logger.error(
      //     `Input variable ${variableName} is missing from ${templateName}`,
      //   );
      throw new RefinePromptsInputVariablesError(templateName, variableName);
    }
  }

  //   Retrieve the available model based on the given model name -- SAME ISSUE
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
