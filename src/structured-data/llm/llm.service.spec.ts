import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { LlmService } from './llm.service';

// import { ISOLogger } from '@/logger/isoLogger.service';

jest.retryTimes(3);

// Create Test Suite for LLMService.
describe('LLMService', () => {
  let service: LlmService;
  let configService: ConfigService;

  //   let logger: ISOLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [LlmService],
    }).compile();

    service = module.get<LlmService>(LlmService);
    configService = module.get<ConfigService>(ConfigService);
    // logger = await module.resolve<ISOLogger>(ISOLogger);

    let model = {
      apiKey: configService.get('OPENAI_API_KEY'),
      name: 'gpt-3.5-turbo',
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Create Test Suite for generateOutput method in LLMService. It should be defined in the module itself and should return an object with output and debugReport properties.
});
