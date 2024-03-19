import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private authService: AuthService) {
    super(
      {
        header: 'X-API-KEY',
        prefix: '',
      },
      true,
      (apiKey: string, done) => {
        this.authService.validateApiKey(apiKey)
          ? done(null, true)
          : done(new UnauthorizedException(), false);
      },
    );
  }
}
