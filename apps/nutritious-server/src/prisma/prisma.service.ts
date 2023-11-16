import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma, $Enums } from '@prisma/client';
import { BaseDMMF } from '@prisma/client/runtime/library';

// TODO: find better way of patching bigint
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
BigInt.prototype.toJSON = function () { return this.toString(); };

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	public readonly _dmmf:BaseDMMF = Prisma.dmmf;

	async onModuleInit() {
		await this.$connect();
	}
}


/** all registered models */
export type PrismaServiceModelName = Prisma.ModelName;
/** all registered enums */
export type PrismaServiceEnumName = keyof typeof $Enums;
