import dump     from '../debug/dump'
import Response from '../server/response'
import Request  from './request'

export default class Action
{

	protected htmlResponse(body: string, statusCode: number = 200)
	{
		if (!body.startsWith('<!DOCTYPE html>')) {
			body = '<!DOCTYPE html>' + "\n" + body
		}
		return new Response(body, statusCode, { 'Content-Type': 'text/html' })
	}

	protected jsonResponse(data: object, statusCode: number = 200)
	{
		const json = JSON.stringify(data, (_, value) => typeof value === 'bigint' ? value.toString() : value)
		return new Response(json, statusCode, { 'Content-Type': 'application/json' })
	}

	run(request: Request): Promise<Response>|Response
	{
		return new Response('Action' + dump(request.objects))
	}

}
