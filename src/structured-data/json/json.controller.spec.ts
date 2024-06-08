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

  describe('extractSchema()', () => {
    const text = 'This is a text';
    const schema = '{"title": "string"}';

    it('should return a JsonExtractResultDto from a correct data structuring request', async () => {
      const json = await controller.extractSchema({
        text,
        model,
        jsonSchema: schema,
      });

      expect(json).toBeDefined();
      expect(json).toMatchObject({
        model: expect.any(String),
        output: expect.any(String),
      });
      expect(() => JSON.parse(json.output)).not.toThrow();
    }, 30000);

    it("should call extractWitSchemaAndRefine() if the 'refine' parameter is set to true", async () => {
      const spy = jest.spyOn(service, 'extractWithSchemaAndRefine');

      await controller.extractSchema({
        text,
        model,
        jsonSchema: schema,
        refine: true,
      });

      expect(spy).toHaveBeenCalled();
    });

    it("should call extractWitSchemaAndRefine() if the 'refine' parameter is a correct RefineParams object", async () => {
      const refine = {
        chunkSize: 100,
        overlap: 0,
      };

      const spy = jest.spyOn(service, 'extractWithSchemaAndRefine');

      await controller.extractSchema({
        text,
        model,
        jsonSchema: schema,
        refine,
      });
      expect(spy).toHaveBeenCalled();
    });

    it('should throw a UnprocessableEntityException if the output is not a valid json', async () => {
      jest.spyOn(service, 'extractWithSchema').mockImplementation(async () => {
        throw new InvalidJsonOutputError();
      });

      await expect(
        controller.extractSchema({
          text,
          model,
          jsonSchema: schema,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
      //   expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a UnprocessableEntityException if the llm could not generate an output', async () => {
      jest.spyOn(service, 'extractWithSchema').mockImplementation(async () => {
        throw new LLMBadRequestReceivedError();
      });

      await expect(
        controller.extractSchema({
          text,
          model,
          jsonSchema: schema,
        }),
      ).rejects.toThrow(UnprocessableEntityException);
      //   expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if the given api key is missing', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
      };

      await expect(
        controller.extractSchema({
          text,
          model,
          jsonSchema: schema,
        }),
      ).rejects.toThrow(BadRequestException);
      //   expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw a BadRequestException if the given api key is invalid', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
        apiKey: 'invalid',
      };
      await expect(
        controller.extractSchema({
          text,
          model,
          jsonSchema: schema,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
