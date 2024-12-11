import { FastifyReply, FastifyRequest } from 'fastify'
import { Method, Request }              from './request'
import Response                         from './response'

export const fastifyRequest = async (request: FastifyRequest<{ Params: Record<string, string> }>) =>
{
	const data = (request.body ?? request.query) as Record<string, string>
	const files: Record<string, Buffer> = {}
	const params = { ...request.params }
	const path   = '/' + request.params['*']
	delete params['*']

	if (request.isMultipart()) {
		for await (const part of request.parts()) {
			if (part.type === 'field') {
				data[part.fieldname] = part.value as string
			}
			if (part.type === 'file') {
				files[part.filename] = await part.toBuffer()
			}
		}
	}

	return new Request(
		request.method as Method,
		request.protocol,
		request.hostname,
		request.port,
		path,
		request.headers as Record<string, string>,
		params,
		data,
		files,
		request.session
	)
}

export const fastifyResponse = (fastifyResponse: FastifyReply, response: Response) =>
{
	for (const [index, value] of Object.entries(response.headers)) fastifyResponse.header(index, value)
	fastifyResponse.statusCode = response.statusCode
	return fastifyResponse.send(response.body)
}
