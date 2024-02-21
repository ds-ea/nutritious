import { CrudQueryObj } from 'nestjs-prisma-crud';


export type JsxQuery = {
	s?:QuerySearchPart | string;
	limit?:number;
	page?:number;
	offset?:number;
};

export type QueryFilterItem =
	| { $eq:unknown };

export type QueryFilterMap = Record<string, QueryFilterItem>;

export type QuerySearchPart = {
	$and?:QueryFilterMap[]
};

export type CrudQueryTranslatorOptions = {
	injectNotDeleted?:boolean
};

export class CrudQueryTranslator{
	public static fromJsxToCrud( query:JsxQuery, options:CrudQueryTranslatorOptions = { injectNotDeleted: true } ):CrudQueryObj{
		const crud:CrudQueryObj = {};

		if( options?.injectNotDeleted ){
			crud.where ??= {};
			crud.where.state = { not: 'DELETED' };
		}

		if( !query || typeof query !== 'object' )
			return crud;

		if( query.s ){
			const search:QuerySearchPart = typeof query.s === 'string' ? JSON.parse( query.s ) : query.s;
			crud.where = { ...crud.where, ...CrudQueryTranslator.translateWhere( search ) };
		}

		if( 'limit' in query )
			crud.pageSize = Number( query.limit );
		if( 'page' in query )
			crud.page = Number( query.page );

		// CONTINUE: unsure what 'offset' does if page and pageSize are also set?
		//		if( 'offset' in query )
		//			crud. = query.limit;

		return crud;
	}

	private static translateWhere( search:QuerySearchPart ):CrudQueryObj['where']{
		const where:CrudQueryObj['where'] = {};

		if( search.$and )
			for( const condition of search.$and )
				for( const [ key, filter ] of Object.entries( condition ) ){
					if( filter.$eq )
						where[key] = filter.$eq;
				}

		return where;
	}
}
