import { JsonController } from './json/json.controller';
import { JsonService } from './json/json.service';
import { LLMService } from './llm/llm.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [JsonController],
  providers: [LLMService, JsonService],
})
export class StructuredDataModule {}
