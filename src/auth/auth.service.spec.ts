import { Test, TestingModule } from '@nestjs/testing';

import { ApiKey } from '../database/entities/api-key.entity';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthService', () => {
  let authService: AuthService;
  //   mocking the api key repository

  const apikeyRepositoryMock = {
    findOneBy: jest.mock,
  };

  const apiKeyMock = {
    id: 'b2edb9e5-8999-4aca-af65-6deacfd1bb9a',
  } as ApiKey;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: apikeyRepositoryMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  //   Testing
  describe('validateApiKey', () => {
    it('should return false if api key is in Invalid format', async () => {
      apikeyRepositoryMock.findOneBy = jest.fn().mockResolvedValue(null);
      const apiKey = 'invalid-api-key-format';
      const result = await authService.validateApiKey(apiKey);
      expect(apikeyRepositoryMock.findOneBy).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false if api key does not exists', async () => {
      apikeyRepositoryMock.findOneBy = jest.fn().mockResolvedValue(null);
      const apiKey = 'b2edb9e5-8999-4aca-af65-6deacfd1bb9b';
      const result = await authService.validateApiKey(apiKey);
      expect(apikeyRepositoryMock.findOneBy).toHaveBeenCalledWith({
        id: apiKey,
      });
      expect(result).toBe(false);
    });

    it('should return true if api key exists', async () => {
      apikeyRepositoryMock.findOneBy = jest.fn().mockResolvedValue(apiKeyMock);
      const result = await authService.validateApiKey(apiKeyMock.id);
      expect(apikeyRepositoryMock.findOneBy).toHaveBeenCalledWith({
        id: apiKeyMock.id,
      });
      expect(result).toBe(true);
    });
  });
});
