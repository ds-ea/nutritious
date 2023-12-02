import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@nutritious/server';
import { FastifyRequest } from 'fastify';


@Injectable()
export class AuthGuard implements CanActivate{
	constructor(
		private readonly jwtService:JwtService,
		private readonly prisma:PrismaService,
	){}

	async canActivate( context:ExecutionContext ):Promise<boolean>{
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader( request );
		if( !token ){
			throw new UnauthorizedException();
		}

		try{
			const payload = await this.jwtService.verifyAsync(
				token,
				{
					secret: process.env['JWT_SECRET'],
				},
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
