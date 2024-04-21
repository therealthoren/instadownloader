import { Test, TestingModule } from '@nestjs/testing';
import { S3SystemService } from './s3-system.service';

describe('S3SystemService', () => {
  let service: S3SystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3SystemService],
    }).compile();

    service = module.get<S3SystemService>(S3SystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
