import './class/compose'
import 'reflect-metadata'

import fastify                             from 'fastify'
import Action                              from './action/action'
import Exception                           from './action/exception'
import { needOf }                          from './action/need'
import ActionRequest                       from './action/request'
import { fastifyRequest, fastifyResponse } from './server/fastify'
import Response                            from './server/response'

async function execute(request: ActionRequest): Promise<Response>
{
	const accept  = request.request.headers.accept
	const accepts = accept ? accept.replace(/ /g, '').split(',') : []
	const format  = (
		[['html', 'text/html'], ['json', 'application/json']].find(([,mime]) => accepts.includes(mime))
		?? ['text', 'text/plain']
	)[0]
	let action: Action
	if (!request.action) {
		throw new Exception('Action is missing')
	}
	try {
		action = new (require('./crud/' + format + '/' + request.action).default)()
	}
	catch {
		throw new Exception('Action ' + request.action + ' not found')
	}
	const objects = await request.getObjects()
	if ((needOf(action) === 'object') && !objects.length) {
		return new Exception('Action ' + request.action + ' needs an object').response
	}
	return action.run(request)
}

const server = fastify()

server.get<{ Params: { [index: string]: string, '*': string } }>('/*', async (originRequest, finalResponse) =>
{
	const request = fastifyRequest(originRequest)
	if (request.path === '/favicon.ico') return
	let response: Response
	try {
		response = await execute(new ActionRequest(request))
	}
	catch(exception) {
		console.error(request.path)
		console.error(exception)
		if (exception instanceof Exception) {
			response = exception.response
		}
		else {
			throw exception
		}
	}
	return fastifyResponse(finalResponse, response)
})

server.listen({ port: 3000 }).then()

console.log('server is listening on http://localhost:3000')
