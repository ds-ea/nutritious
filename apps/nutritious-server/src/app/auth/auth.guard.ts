import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@nutritious/server';
import { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from '../core/decorators/public.decorator';


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

		const request = context.switchToHttp().getRequest();
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

			const userId = payload.sub;
			const user = userId
						 ? await this.prisma.user.findUnique( { where: { id: userId } } )
						 : undefined;
			if( !user )
				throw new UnauthorizedException();

			request['user'] = user;

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
