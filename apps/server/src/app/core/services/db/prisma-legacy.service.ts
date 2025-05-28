import { Injectable, OnModuleInit } from '@nestjs/common';
import { $Enums, Prisma, PrismaClient } from '@nutritious/core/legacy';

// TODO: find better way of patching bigint
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
BigInt.prototype.toJSON = function(){ return this.toString(); };

@Injectable()
export class PrismaLegacyService extends PrismaClient implements OnModuleInit{
	public readonly _dmmf = Prisma.dmmf;

	async onModuleInit(){
		//		await this.$connect();
	}
}


/** all registered models */
export type PrismaLegacyServiceModelName = Prisma.ModelName;
/** all registered enums */
export type PrismaLegacyServiceEnumName = keyof typeof $Enums;
