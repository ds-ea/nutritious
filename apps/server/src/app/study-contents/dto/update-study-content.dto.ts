import { PartialType } from '@nestjs/mapped-types';
import { CreateStudyContentDto } from './create-study-content.dto';

export class UpdateStudyContentDto extends PartialType(CreateStudyContentDto) {}
