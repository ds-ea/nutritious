import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nutritious/core';
import { Page } from '@prisma/client';


export type NavElement = {
	page:Pick<Page, 'id' | 'slug' | 'title'>;
	name:string;
	href:string;
	children?:NavElement[];
}

@Injectable()
export class PageService{

	constructor(
		private readonly prisma:PrismaService,
	){}

	public async findPage( path:string ):Promise<Page | undefined>{
		const page = await this.prisma.page.findUnique( {
			where: {
				slug: path,
			},
		} );

		return page?.status !== 'ACTIVE'
			   ? undefined
			   : page
			;
	}

	public async getNav():Promise<NavElement[]>{
		const pages = await this.prisma.page.findMany( {
			where: { status: 'ACTIVE' },
			select: { id: true, slug: true, title: true },
		} );

		return pages
			.filter( p => p.slug != 'home' && p.slug != '' )
			.map( page => {
				return ( {
					page,
					name: page.title,
					href: page.slug,
				} );
			} );
	}
}
