import { Headers, Response } from '@itrocks/server'

export default class PdfResponse extends Response
{

	constructor(data: any, statusCode = 200, headers: Headers = {})
	{
		if (!headers['Content-Type']) {
			headers['Content-Type'] = 'application/pdf'
		}
		super(data, statusCode, headers)
	}

}
