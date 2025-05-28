import { Injectable, OnModuleInit } from '@nestjs/common';
import { $Enums, Prisma, PrismaClient } from '@prisma/client';
import { BaseDMMF } from '@prisma/client/runtime/library';

// TODO: find better way of patching bigint
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
BigInt.prototype.toJSON = function(){ return this.toString(); };

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit{
	public readonly _dmmf:BaseDMMF = Prisma.dmmf;

	constructor(){
		super();
	}

	async onModuleInit(){
		await this.$connect();
	}
}

/*const prismaService = new PrismaBaseService().$extends( {
	query: {
		user: {
			async $allOperations( { model, operation, args, query } ){
				if( [ 'create', 'createMany', 'update', 'updateMany', 'upsert' ].includes( operation ) ){
				}
				return query( args );
			},

			async create( { model, operation, args, query } ){
				return query( args );
			},

		},
	},
} );

export type PrismaService = typeof prismaService;
export default prismaService;*/

/** all registered models */
export type PrismaServiceModelName = Prisma.ModelName;
/** all registered enums */
export type PrismaServiceEnumName = keyof typeof $Enums;



