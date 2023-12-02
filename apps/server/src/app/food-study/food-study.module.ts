import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { FoodStudyController } from './food-study.controller';
import { FoodStudyService } from './food-study.service';

@Module({
	imports: [ CoreModule ],
	controllers: [FoodStudyController],
	providers: [FoodStudyService],
})
export class FoodStudyModule {}
