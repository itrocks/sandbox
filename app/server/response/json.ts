import { Headers, Response } from '../response'

export default class JsonResponse extends Response
{

	constructor(data: any, statusCode = 200, headers: Headers = {})
	{
		const json = JSON.stringify(data, (_, value) => typeof value === 'bigint' ? value.toString() : value)
		if (!headers['Content-Type']) {
			headers['Content-Type'] = 'application/json'
		}
		super(json, statusCode, headers)
	}

}
