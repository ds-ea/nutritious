import { Test, TestingModule } from '@nestjs/testing';
import { BlsController } from './bls.controller';
import { BlsService } from './bls.service';

describe('BlsController', () => {
  let controller: BlsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlsController],
      providers: [BlsService],
    }).compile();

    controller = module.get<BlsController>(BlsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
