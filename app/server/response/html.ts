import { Headers, Response } from '@itrocks/server'

export default class HtmlResponse extends Response
{

	constructor(body = '', statusCode = 200, headers: Headers = {})
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
