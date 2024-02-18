import { Injectable } from '@nestjs/common';
import { LegacyPage, PrismaLegacyService } from '@nutritious/core/legacy';


export type NavElement = {
	page:Pick<LegacyPage, 'id' | 'slug' | 'title'>;
	name:string;
	href:string;
	children?:NavElement[];
}

@Injectable()
export class PageService{

	constructor(
		private readonly prisma:PrismaLegacyService,
	){}

	public async findPage( path:string ):Promise<LegacyPage | undefined>{
		const page = await this.prisma.legacyPage.findUnique( {
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
		const pages = await this.prisma.legacyPage.findMany( {
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
