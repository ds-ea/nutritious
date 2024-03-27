export type ContentFormats = 'plain' | 'md' | 'html';
export type ContentContainer = {
	[type in ContentFormats]?:{
		data:string;
		meta?:Record<string, string>;
	}
}
