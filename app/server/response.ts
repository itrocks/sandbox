
export default class Response
{

	constructor(
		public body:       object|string = '',
		public statusCode: number = 200,
		public headers:    { [index: string]: string } = {},
	) {}

}
