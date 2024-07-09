
export type Method = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'

export class Request
{

	constructor(
		public readonly method:     Method,
		public readonly scheme:     string,
		public readonly host:       string,
		public readonly path:       string,
		public readonly headers:    { [index: string]: string } = {},
		public readonly parameters: { [index: string]: string } = {},
		public readonly data:       { [index: string]: string } = {},
		public readonly files:      { [index: string]: Buffer } = {}
	) {}

	get url()
	{
		const value = new URL(this.scheme + '://' + this.host + this.path)
		Object.defineProperty(this, 'url', { value, writable: false })
		return value
	}

}
export default Request
