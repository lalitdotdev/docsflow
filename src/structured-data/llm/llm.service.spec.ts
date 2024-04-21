import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  LLMApiKeyInvalidError,
  LLMApiKeyMissingError,
  LLMNotAvailableError,
  PromptTemplateFormatError,
} from './exceptions/exceptions';
import { Test, TestingModule } from '@nestjs/testing';

import { LlmService } from './llm.service';
import { PromptTemplate } from 'langchain/prompts';

// import { ISOLogger } from '@/logger/isoLogger.service';

jest.retryTimes(3);

// Create Test Suite for LLMService.
describe('LLMService', () => {
  let service: LlmService;
  let configService: ConfigService;
  let model: {
    apiKey: string;
    name: string;
  };
  //   let logger: ISOLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [LlmService],
    }).compile();

    service = module.get<LlmService>(LlmService);
    configService = module.get<ConfigService>(ConfigService);
    // logger = await module.resolve<ISOLogger>(ISOLogger);

    model = {
      apiKey: configService.get('OPENAI_API_KEY'),
      name: 'gpt-3.5-turbo',
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Create Test Suite for generateOutput method in LLMService. It should be defined in the module itself and should return an object with output and debugReport properties.

  describe('generateOutput()', () => {
    // Create a new PromptTemplate instance with the given template and input variables.
    const promptTemplate = new PromptTemplate({
      template: 'What is a good name for a company that makes {product}?',
      inputVariables: ['product'],
    });

    // It should generate an output with the given model, prompt template, and chain values.
    it('should generate an output', async () => {
      const { output, debugReport } = await service.generateOutput(
        model,
        promptTemplate,
        {
          product: 'cars',
        },
      );
      expect(output).toBeDefined();
      expect(output).toHaveProperty('text');
      expect(output.text).toBeTruthy();
      expect(debugReport).toBeNull();
    }, 30000);

    // It should generate an output with a debug report if the debug flag is set to true.
    it('should generate an output with a debug report', async () => {
      const { output, debugReport } = await service.generateOutput(
        model,
        promptTemplate,
        {
          product: 'cars',
        },
        true,
      );

      expect(output).toBeDefined();
      expect(output).toHaveProperty('text');
      expect(output.text).toBeTruthy();

      expect(debugReport).toBeDefined();
      expect(debugReport).toHaveProperty('chainCallCount');
      expect(debugReport).toHaveProperty('llmCallCount');
      expect(debugReport).toHaveProperty('chains');
      expect(debugReport).toHaveProperty('llms');
    }, 30000);
  });
});
