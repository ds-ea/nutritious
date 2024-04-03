import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { EntityState } from '@nutritious/core';
import { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from '../core/decorators/public.decorator';
import { PrismaService } from '../core/services/db/prisma.service';
import { AuthedRequest } from '../types/server.types';


@Injectable()
export class AuthGuard implements CanActivate{
	constructor(
		private readonly config:ConfigService,
		private readonly jwtService:JwtService,
		private readonly prisma:PrismaService,
		private reflector:Reflector,
	){}

	async canActivate( context:ExecutionContext ):Promise<boolean>{
		const isPublic = this.reflector.getAllAndOverride<boolean>( IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		] );

		if( isPublic )
			return true;

		const request = context.switchToHttp().getRequest() as AuthedRequest;
		const token = this.extractTokenFromHeader( request );
		if( !token ){
			throw new UnauthorizedException();
		}

		const secret = this.config.get<string>( 'JWT_SECRET' );

		try{
			const payload = await this.jwtService.verifyAsync(
				token,
				{ secret },
			);

			if( !payload.exp || payload.exp < ( Date.now() / 1000 ) )
				throw new UnauthorizedException();

			const participantId = payload.sub?.participant;
			const userId = payload.sub?.user;

			let authed = false;

			if( participantId ){
				const participant = await this.prisma.participant.findUnique( { where: { id: participantId } } );
				request.participant = participant || undefined;
				authed = participant?.state === EntityState.Enabled;

			}else if( userId ){
				const user = await this.prisma.user.findUnique( { where: { id: userId } } );
				request.user = user || undefined;
				authed = user?.state === EntityState.Enabled;
			}

			if( !authed )
				throw new UnauthorizedException();

		}catch{
			throw new UnauthorizedException();
		}

		return true;
	}

	private extractTokenFromHeader( request:FastifyRequest ):string | undefined{
		const [ type, token ] = request.headers.authorization?.split( ' ' ) ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
