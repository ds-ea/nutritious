import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { CrudQueryObj } from 'nestjs-prisma-crud';
import { CrudQueryTranslator, CrudQueryTranslatorOptions } from '../utils/crud-query-translator';


export type CrudQueryData = CrudQueryObj;

export const CrudQuery = createParamDecorator(
	( options:CrudQueryTranslatorOptions | undefined, ctx:ExecutionContext ):CrudQueryData => {
		const request = ctx.switchToHttp().getRequest();
		const jsxQuery = request.query ?? {};
		return CrudQueryTranslator.fromJsxToCrud( jsxQuery, options );
	},
);
