import Response from '../server/response'

export default class Exception extends Error
{

	response: Response

	constructor(response: Response | string, statusCode: number = 404)
	{
		super()
		this.response = (typeof response === 'string')
			? new Response(response, statusCode)
			: response
	}

}
