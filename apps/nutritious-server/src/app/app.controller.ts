import { Controller, Get, NotFoundException, Render, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

import { AppService } from './app.service';
import { PageService } from './pages/page.service';


@Controller()
export class AppController{
	constructor(
		private readonly appService:AppService,
		private readonly pageService:PageService,
	){}

	@Get()
	@Render( 'home' )
	async root(){
		const page = await this.pageService.findPage('home');
		const nav = await this.pageService.getNav();
		return { page, nav };
	}

	@Get( ':any' )
	@Render( 'page' )
	async dynamicPages( @Req() req:FastifyRequest ){
		const page = await this.pageService.findPage( req.url.substring(1) );
		if( !page )
			throw new NotFoundException();
		const nav = await this.pageService.getNav();
		return { page, nav };
	}
}
