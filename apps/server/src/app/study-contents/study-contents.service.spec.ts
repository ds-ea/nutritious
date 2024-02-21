import { Test, TestingModule } from '@nestjs/testing';
import { StudyContentsService } from './study-contents.service';

describe('StudyContentsService', () => {
  let service: StudyContentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudyContentsService],
    }).compile();

    service = module.get<StudyContentsService>(StudyContentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
