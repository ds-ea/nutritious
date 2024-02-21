import { Test, TestingModule } from '@nestjs/testing';
import { BlsService } from './bls.service';

describe('BlsService', () => {
  let service: BlsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlsService],
    }).compile();

    service = module.get<BlsService>(BlsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
