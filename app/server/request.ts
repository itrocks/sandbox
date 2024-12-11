
export type Method = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'

export type RecursiveString       = RecursiveStringArray | RecursiveStringObject | string
export type RecursiveStringArray  = RecursiveString[]
export type RecursiveStringObject = { [index: string]: RecursiveString | unknown }

export class Request
{

	constructor(
		public readonly method:     Method,
		public readonly scheme:     string,
		public readonly host:       string,
		public readonly port:       number,
		public readonly path:       string,
		public readonly headers:    Record<string, string> = {},
		public readonly parameters: Record<string, string> = {},
		public readonly data:       RecursiveStringObject  = {},
		public readonly files:      Record<string, Buffer> = {},
		public readonly session:    Record<string, any>    = {}
	) {}

	get url()
	{
		const port  = (this.port ? (':' + this.port) : '')
		const value = new URL(this.scheme + '://' + this.host + port + this.path)
		Object.defineProperty(this, 'url', { value })
		return value
	}

}
export default Request
