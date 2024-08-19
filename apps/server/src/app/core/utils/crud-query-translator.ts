import { CrudQueryObj } from 'nestjs-prisma-crud';


export type JsxQuery = {
	s?:QuerySearchPart | string;
	limit?:number;
	page?:number;
	offset?:number;
	'join[0]'?:string;
};

export type QueryFilterItem =
	| { $eq:unknown };

export type QueryFilterMap = Record<string, QueryFilterItem>;

export type QuerySearchPart = {
	$and?:QueryFilterMap[]
};

export type CrudQueryTranslatorOptions = {
	injectNotDeleted?:boolean,
	noLimiting?:boolean
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

		if( options.noLimiting ){
			delete crud.page;
			delete crud.pageSize;
		}


		// CONTINUE: unsure what 'offset' does if page and pageSize are also set?
		//		if( 'offset' in query )
		//			crud. = query.limit;


		// TODO: add proper query parsing I guess? this thing currently doesn't parse keys properly
		if( 'join[0]' in query && query['join[0]'] )
			crud.joins = [ query['join[0]'] ];


		if( 'sort[0]' in query && query['sort[0]'] ){
			if( typeof query['sort[0]'] === 'string' ){
				const parts = query['sort[0]'].split( ',' );
				crud.orderBy = [ { [parts[0]]: parts[1].toLowerCase() } ];
			}
		}

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
