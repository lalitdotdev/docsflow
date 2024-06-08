import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { InvalidJsonOutputError } from './exceptions/exceptions';
import { JsonService } from './json.service';
import { LLMService } from '../llm/llm.service';

jest.retryTimes(3);
describe('JsonService', () => {
  let service: JsonService;
  let llmService: LLMService;
  let configService: ConfigService;
  let model: {
    apiKey: string;
    name: string;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [JsonService, LLMService],
    }).compile();

    service = module.get<JsonService>(JsonService);
    llmService = module.get<LLMService>(LLMService);
    configService = module.get<ConfigService>(ConfigService);
    model = {
      apiKey: configService.get('OPENAI_API_KEY'),
      name: 'gpt-3.5-turbo',
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractWithSchema()', () => {
    const text = 'This is a text';

    const schema = '{"title": "string" , "description": "string"}';

    it('should return a json object', async () => {
      const { json } = await service.extractWithSchema(model, text, schema);

      expect(json).toBeDefined();
      expect(json).toHaveProperty('title');
    }, 30000);

    it('should throw an error if the output is not a valid json', async () => {
      jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
        output: {
          text: '{"title": "string"',
        },
        debugReport: null,
      });

      await expect(
        service.extractWithSchema(model, text, schema),
      ).rejects.toThrow(InvalidJsonOutputError);
      //   expect(logger.warn).toHaveBeenCalled();
    });
  });
});
