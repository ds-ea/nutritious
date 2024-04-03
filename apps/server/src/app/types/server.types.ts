import { LegacyUser } from '@nutritious/core/legacy';
import { Participant, User } from '@prisma/client';
import { FastifyRequest } from 'fastify';


export interface AuthedRequest extends FastifyRequest{
	user?:User;
	participant?:Participant;

	// DEV: remove when legacy stuff has been removed
	legacyUser?:LegacyUser;
}
