import { LegacyUser } from '@nutritious/core';
import { User } from '@prisma/client';
import { FastifyRequest } from 'fastify';


export interface AuthedRequest extends FastifyRequest{
	user?:User;
	legacyUser?:LegacyUser;
}
