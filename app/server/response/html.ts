import Response from '../response'

export default class HtmlResponse extends Response
{

	constructor(body: string = '', statusCode: number = 200, headers: { [index: string]: string } = {})
	{
		if (!body.startsWith('<!DOCTYPE html>')) {
			body = `<!DOCTYPE html>\n` + body
		}
		if (!headers['Content-Type']) {
			headers['Content-Type'] = 'text/html'
		}
		super(body, statusCode, headers)
	}

}
