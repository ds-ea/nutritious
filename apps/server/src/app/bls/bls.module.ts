import { Module } from '@nestjs/common';
import { BlsService } from './bls.service';
import { BlsController } from './bls.controller';

@Module({
  controllers: [BlsController],
  providers: [BlsService]
})
export class BlsModule {}
