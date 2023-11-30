import dump from '../debug/dump'
import Request from './request'

class Action
{

	protected htmlResponse(body: string)
	{
		if (!body.startsWith('<!DOCTYPE html>')) {
			body = '<!DOCTYPE html>' + body
		}
		return new Response(body, { headers: [['Content-Type', 'text/html']] })
	}

	protected jsonResponse(data: object)
	{
		return new Response(JSON.stringify(data), { headers: [['Content-Type', 'application/json']] })
	}

	run(request: Request): Promise<Response>|Response
	{
		return new Response('Action' + dump(request.objects))
	}

}

export default Action
