import type { Prisma } from '@nutritious/core';

/*
import { PartialType } from '@nestjs/mapped-types';
import { CreateFormInputPresetDto } from './create-study-form.dto';


export class UpdateFormInputPresetDto extends PartialType( CreateFormInputPresetDto ){}
*/

export type UpdateFormInputPresetDto = Prisma.FormInputPresetUncheckedUpdateInput;
