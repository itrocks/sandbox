
export type Headers = { [index: string]: string }

export class Response
{

	constructor(
		public body:       object|string = '',
		public statusCode: number        = 200,
		public headers:    Headers       = {},
	) {}

}
export default Response
