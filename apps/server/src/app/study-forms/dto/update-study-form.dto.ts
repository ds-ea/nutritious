import type { Prisma } from '@nutritious/core';

/*
import { PartialType } from '@nestjs/mapped-types';
import { CreateStudyFormDto } from './create-study-form.dto';


export class UpdateStudyFormDto extends PartialType( CreateStudyFormDto ){}
*/

export type UpdateStudyFormDto = Prisma.StudyFormUncheckedUpdateInput;
