import { Test, TestingModule } from '@nestjs/testing';
import { FoodStudyService } from './food-study.service';

describe('FoodStudyService', () => {
	let service: FoodStudyService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [FoodStudyService],
		}).compile();

		service = module.get<FoodStudyService>(FoodStudyService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
