import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { InvalidJsonOutputError } from './exceptions/exceptions';
import { JsonController } from './json.controller';
import { JsonService } from './json.service';
import { LLMBadRequestReceivedError } from '../llm/exceptions/exceptions';
import { LLMService } from '../llm/llm.service';

describe('JsonController', () => {
  let controller: JsonController;
  let service: JsonService;
  let configService: ConfigService;
  let model: {
    apiKey: string;
    name: string;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JsonController],
      providers: [JsonService, LLMService],
      imports: [ConfigModule.forRoot()],
    }).compile();

    controller = module.get<JsonController>(JsonController);
    service = module.get<JsonService>(JsonService);
    configService = module.get<ConfigService>(ConfigService);
    model = {
      apiKey: configService.get('OPENAI_API_KEY'),
      name: 'gpt-3.5-turbo',
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
