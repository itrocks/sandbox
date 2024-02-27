import { FastifyReply, FastifyRequest } from 'fastify'
import { Method, Request }              from './request'
import Response                         from './response'

export const fastifyRequest = (request: FastifyRequest<{ Params: { [index: string]: string } }>) =>
{
	const params = { ...request.params }
	const path   = '/' + request.params['*']
	delete params['*']

	return new Request(
		request.method as Method,
		request.protocol,
		request.hostname,
		path,
		request.headers as { [index: string]: string },
		params
	)
}

export const fastifyResponse = (fastifyResponse: FastifyReply, response: Response) =>
{
	for (const [index, value] of Object.entries(response.headers)) fastifyResponse.header(index, value)
	fastifyResponse.statusCode = response.statusCode
	return fastifyResponse.send(response.body)
}
