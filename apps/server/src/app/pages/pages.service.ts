import { Injectable } from '@nestjs/common';
import { Page, PrismaService } from '@nutritious/core';
import { CrudMethodOpts, PrismaCrudService } from 'nestjs-prisma-crud';



export type NavElement = {
	page:Pick<Page, 'id' | 'alias' | 'name'>;
	name:string;
	href:string;
	children?:NavElement[];
}


@Injectable()
export class PagesService extends PrismaCrudService{

	constructor( private readonly prisma:PrismaService ){
		super( {
			model: 'page',
			allowedJoins: [],
			defaultJoins: [],
		} );
	}



	public override findMany( opts:CrudMethodOpts ){
		/*opts.crudQuery = {
			select: { only: [ 'id', 'alias', 'name', 'state' ] },
		};*/
		return super.findMany( opts );
	}


	public override update( id:string | number, updateDto:any, opts:CrudMethodOpts ):Promise<any>{
		if( 'id' in updateDto )
			delete updateDto['id'];

		return super.update( id, updateDto, opts );
	}

	public async findPage( path:string ):Promise<Page | undefined>{
		const page = await this.prisma.page.findUnique( {
			where: {
				alias: path,
			},
		} );

		return page?.state !== 'ENABLED'
			   ? undefined
			   : page
			;
	}

	public async getNav():Promise<NavElement[]>{
		const pages = await this.prisma.page.findMany( {
			where: { state: 'ENABLED', nav: { not: null } },
			select: { id: true, alias: true, name: true },
		} );

		return pages
			.filter( p => p.alias != 'home' && p.alias != '' )
			.map( page => {
				return ( {
					page,
					name: page.name,
					href: page.alias,
				} );
			} );
	}
}
