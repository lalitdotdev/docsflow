import { ApiKey } from 'src/database/entities/api-key.entity';
import { ApiKeyStrategy } from './strategy/apiKey.strategy';
import { Application } from 'src/database/entities/application.entity';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([ApiKey, Application])],
  providers: [AuthService, ApiKeyStrategy],
  exports: [AuthService],
})
export class AuthModule {}
