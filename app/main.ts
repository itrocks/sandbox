import './class/compose'
import './expand'
import 'reflect-metadata'

import fastify                             from 'fastify'
import { readFile }                        from 'node:fs/promises'
import Action                              from './action/action'
import Exception                           from './action/exception'
import { needOf }                          from './action/need'
import ActionRequest                       from './action/request'
import { appPath }                         from './app'
import { fastifyRequest, fastifyResponse } from './server/fastify'
import Response                            from './server/response'

async function execute(request: ActionRequest)
{
	let action: Action & { [index: string]: (request: ActionRequest) => Promise<Response> }
	if (!request.action) {
		throw new Exception('Action is missing')
	}
	try {
		action = new (require('./action/builtIn/' + request.action + '/' + request.action).default)()
	}
	catch (exception) {
		console.error(exception)
		throw new Exception('Action ' + request.action + ' not found')
	}
	if (!action[request.format]) {
		throw new Exception('Action ' + request.action + ' unavailable in format ' + request.format)
	}
	const objects = await request.getObjects()
	if ((needOf(action) === 'object') && !objects.length) {
		return new Exception('Action ' + request.action + ' needs an object').response
	}
	return action[request.format](request)
}

const server = fastify()

server.get<{ Params: { [index: string]: string, '*': string } }>('/*', async (originRequest, finalResponse) =>
{
	const request = fastifyRequest(originRequest)
	if (request.path === '/favicon.ico') return
	if (request.path.endsWith('.css') && !request.path.includes('./')) {
		const headers = { 'Content-Type': 'text/css; charset=utf-8' }
		return fastifyResponse(finalResponse, new Response(await readFile(appPath + request.path, 'utf-8'), 200, headers))
	}
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
