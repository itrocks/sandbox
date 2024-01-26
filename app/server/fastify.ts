import { FastifyReply, FastifyRequest } from 'fastify'
import Request                          from './request'
import Response                         from './response'

export const fastifyRequest = (request: FastifyRequest<{ Params: { [index: string]: string, '*': string } }>) =>
{
	const path = '/' + request.params['*']
	const params: { [index: string]: string } = { ...request.params }
	delete params['*']

	return new Request(
		request.method,
		request.protocol,
		request.hostname,
		path,
		params,
		request.headers as { [index: string]: string }
	)
}

export const fastifyResponse = (fastifyResponse: FastifyReply, response: Response) =>
{
	Object.entries(response.headers).forEach(([index, value]) => fastifyResponse.header(index, value))
	fastifyResponse.statusCode = response.statusCode
	return fastifyResponse.send(response.body)
}
