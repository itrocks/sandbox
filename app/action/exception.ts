
class Exception extends Error
{

	response: Response

	constructor(response: Response|string, status: number = 404)
	{
		super()
		this.response = (typeof response === 'string')
			? new Response(response, { status: status })
			: response
	}

}

export default Exception
