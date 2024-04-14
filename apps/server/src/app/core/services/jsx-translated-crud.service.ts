import { CrudMethodOpts, PrismaCrudService } from 'nestjs-prisma-crud';


export class JsxTranslatedCrudService extends PrismaCrudService{

	public override findMany( opts:CrudMethodOpts ):Promise<{ data:unknown; totalRecords:number; pageCount:number; page:number; pageSize:number; orderBy:unknown[] }>{
		return super.findMany( opts ).then( results => ( {
			data: results.data,
			total: results.totalRecords,
			pageCount: results.pageCount,
			page: results.page,
			pageSize: results.pageSize,
			orderBy: results.orderBy,
		} ) ) as unknown as ReturnType<PrismaCrudService['findMany']>;
	}
}
