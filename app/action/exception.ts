
class Exception
{

	response: Response

	constructor(response: Response|string, status: number = 404)
	{
		this.response = (typeof response === 'string')
			? new Response(response, { status: status })
			: response
	}

}

export default Exception
