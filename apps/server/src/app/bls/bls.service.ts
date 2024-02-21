import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';

@Injectable()
export class BlsService extends PrismaCrudService {
  constructor() {
    super({
      model: 'bls',
      allowedJoins: [],
      defaultJoins: [],
    });
  }
}
