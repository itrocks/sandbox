import { Response } from '@itrocks/server'

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

	htmlResponse()
	{
		const response = Object.assign(new Response(), this.response)
		response.body = '<p class="error notification">' + response.body + '</p>'
		return response
	}

}
