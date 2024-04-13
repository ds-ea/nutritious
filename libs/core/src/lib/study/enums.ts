export enum StudyStepType{
	'Content' = 'content',
	'Form' = 'form',
	'BlsFood' = 'bls-food-entry',
}

export enum FormInputType{
	Slider = 'slider',
	Text = 'text',
	Number = 'number',
	Choices = 'choices',
	Binary = 'binary',
}

export enum FormInputNecessity{
	Must = 'must',
	Should = 'should',
	Ignore = 'ignore'
}



export enum BLSMealType{
	Breakfast = 'breakfast',
	Lunch = 'lunch',
	Dinner = 'dinner',
	Snack = 'snack',
}

export enum BLSAttendanceOption{
	Alone_Idle = 'alone_idle',
	Alone_Busy = 'alone_busy',
	Two = 'two',
	More = 'more',
}
