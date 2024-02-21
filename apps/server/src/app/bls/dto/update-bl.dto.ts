import { PartialType } from '@nestjs/mapped-types';
import { CreateBlDto } from './create-bl.dto';

export class UpdateBlDto extends PartialType(CreateBlDto) {}
