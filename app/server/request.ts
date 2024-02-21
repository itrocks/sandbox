
export type Method = 'DELETE' | 'GET' | 'PATH' | 'POST' | 'PUT'

export class Request
{

	constructor(
		public method:     Method,
		public scheme:     string,
		public host:       string,
		public path:       string,
		public parameters: { [index: string]: string } = {},
		public headers:    { [index: string]: string } = {},
		public data:       string = ''
	) {}

	get url()
	{
		return new URL(this.scheme + '://' + this.host + this.path)
	}

}
export default Request
