import { Injectable } from '@nestjs/common';
import type { Page, Prisma } from '@nutritious/core';
import { PrismaLegacyService } from './core/services/db/prisma-legacy.service';
import { PrismaService } from './core/services/db/prisma.service';


@Injectable()
export class LegacyMigrationsService{

	constructor(
		private readonly prisma:PrismaService,
		private readonly legacy:PrismaLegacyService,
	){

	}


	async migrateAll(){

		const changes:Record<string, Record<string, number>> = {};

		changes['pages'] = await this._migratePages();


		return changes;
	}

	private async _migratePages(){
		const changes = { existing: 0, added: 0 };

		const oldPages = await this.legacy.legacyPage.findMany();

		const existing = await this.prisma.page.findMany();
		const existingMap = existing.reduce<Record<string, Page>>( ( map, page ) => ( map[page.alias] = page, map ), {} );

		const ops:Promise<unknown>[] = [];

		for( const old of oldPages ){
			if( existingMap[old.slug] ){
				changes.existing++;
				continue;
			}

			const data:Prisma.PageCreateInput = {
				name: old.title,
				alias: old.slug,
				body: old.body,
				state: 'ENABLED',
				nav: 'main',
			};

			ops.push(
				this.prisma.page.create( { data } ),
			);

			changes.added++;
		}

		if( ops.length )
			await Promise.all( ops );

		return changes;
	}

}
