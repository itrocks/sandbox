import Response from '../response'

export default class JsonResponse extends Response
{

	constructor(data: any, statusCode: number = 200, headers: { [index: string]: string } = {})
	{
		const json = JSON.stringify(data, (_, value) => typeof value === 'bigint' ? value.toString() : value)
		if (!headers['Content-Type']) {
			headers['Content-Type'] = 'application/json'
		}
		super(json, statusCode, headers)
	}

}
