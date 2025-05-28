import { Module } from '@nestjs/common';
import { StudyContentsService } from './study-contents.service';
import { StudyContentsController } from './study-contents.controller';

@Module({
  controllers: [StudyContentsController],
  providers: [StudyContentsService]
})
export class StudyContentsModule {}
