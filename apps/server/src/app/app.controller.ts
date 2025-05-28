import { Body, Controller, Get, NotFoundException, Post, Render, Req, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

import { AppService } from './app.service';
import { Public } from './core/decorators/public.decorator';
import { LegacyMigrationsService } from './legacy-migrations.service';
import { PagesService } from './pages/pages.service';


@Public()
@Controller()
export class AppController{
	constructor(
		private readonly appService:AppService,
		private readonly pagesService:PagesService,
		private readonly legacyMigrations:LegacyMigrationsService,
	){}

	@Get()
	@Render( 'home' )
	async root(){
		const page = await this.pagesService.findPage( 'home' );

		if( !page )
			throw new NotFoundException();

		const nav = await this.pagesService.getNav();
		return { page, nav };
	}

	@Get( ':any' )
	@Render( 'page' )
	async dynamicPages( @Req() req:FastifyRequest ){
		const page = await this.pagesService.findPage( req.url.substring( 1 ) );
		if( !page )
			throw new NotFoundException();
		const nav = await this.pagesService.getNav();
		return { page, nav };
	}

	@Post( 'migrations' )
	async runMigrations( @Body() data:{ pass:string } ){
		if( !data?.pass?.length || data?.pass !== process.env['MIGRATIONS_PASS'] )
			throw new UnauthorizedException();

		return this.legacyMigrations.migrateAll();
	}

}
