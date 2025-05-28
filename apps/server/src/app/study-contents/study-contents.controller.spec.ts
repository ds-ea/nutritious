import { Test, TestingModule } from '@nestjs/testing';
import { StudyContentsController } from './study-contents.controller';
import { StudyContentsService } from './study-contents.service';

describe('StudyContentsController', () => {
  let controller: StudyContentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyContentsController],
      providers: [StudyContentsService],
    }).compile();

    controller = module.get<StudyContentsController>(StudyContentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
