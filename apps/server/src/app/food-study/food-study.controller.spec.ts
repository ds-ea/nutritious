import { Test, TestingModule } from '@nestjs/testing';
import { FoodStudyController } from './food-study.controller';

describe('FoodStudyController', () => {
	let controller: FoodStudyController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FoodStudyController],
		}).compile();

		controller = module.get<FoodStudyController>(FoodStudyController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
