import { Injectable, OnModuleInit } from '@nestjs/common';
import { $Enums, Prisma, PrismaClient } from '../../../prisma/generated/client-legacy';
import { BaseDMMF } from '../../../prisma/generated/client-legacy/runtime/library';

// TODO: find better way of patching bigint
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
BigInt.prototype.toJSON = function(){ return this.toString(); };

@Injectable()
export class PrismaLegacyService extends PrismaClient implements OnModuleInit{
	public readonly _dmmf:BaseDMMF = Prisma.dmmf;

	async onModuleInit(){
		//		await this.$connect();
	}
}


/** all registered models */
export type PrismaLegacyServiceModelName = Prisma.ModelName;
/** all registered enums */
export type PrismaLegacyServiceEnumName = keyof typeof $Enums;
