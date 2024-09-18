import './class/compose'
import 'reflect-metadata'

import fastifyFormbody                           from '@fastify/formbody'
import fastifyMultipart                          from '@fastify/multipart'
import { fastify, FastifyReply, FastifyRequest } from 'fastify'
import { readFile, stat }                        from 'node:fs/promises'
import Action                                    from './action/action'
import Exception                                 from './action/exception'
import { needOf }                                from './action/need'
import ActionRequest                             from './action/request'
import { appPath }                               from './app'
import { mimeTypes, utf8Types }                  from './mime'
import { fastifyRequest, fastifyResponse }       from './server/fastify'
import Request                                   from './server/request'
import Response                                  from './server/response'
import { frontScripts }                          from './view/html/template'

async function execute(request: ActionRequest)
{
	let action: Action & { [index: string]: (request: ActionRequest) => Promise<Response> }
	if (!request.action) {
		throw new Exception('Action is missing')
	}
	try {
		action = new (require('./action/builtIn/' + request.action + '/' + request.action).default)
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

async function httpCall(
	originRequest: FastifyRequest<{ Params: { [index: string]: string } }>,
	finalResponse: FastifyReply
) {
	const request = await fastifyRequest(originRequest)
	const dot     = request.path.lastIndexOf('.') + 1
	if ((dot > request.path.length - 6) && !request.path.includes('./')) {
		const fileExtension = request.path.substring(dot)
		if ((fileExtension !== 'js') || request.path.startsWith('/front/') || frontScripts.includes(request.path)) {
			const filePath = (request.path === '/favicon.ico') ? '/app/style/2020/logo/favicon.ico' : request.path
			const mimeType = mimeTypes.get(fileExtension)
			if (mimeType) {
				return fastifyResponse(finalResponse, await httpAsset(request, appPath + filePath, mimeType))
			}
		}
	}
	try {
		return fastifyResponse(finalResponse, await execute(new ActionRequest(request)))
	}
	catch(exception) {
		console.error(request.path)
		console.error(exception)
		if (exception instanceof Exception) {
			return fastifyResponse(finalResponse, exception.response)
		}
		else {
			throw exception
		}
	}
}

async function httpAsset(request: Request, filePath: string, mimeType: string)
{
	const ifModified   = request.headers['if-modified-since']
	const lastModified = new Date((await stat(filePath)).mtime)
	if (ifModified && (new Date(ifModified) >= lastModified)) {
		return new Response('', 304)
	}
	const utf8Type = utf8Types.has(mimeType)
	const headers  = {
		'Content-Type':  mimeType + (utf8Type ? '; charset=utf-8' : ''),
		'Last-Modified': lastModified.toUTCString()
	}
	return new Response(await readFile(filePath, utf8Type ? 'utf-8' : undefined), 200, headers)
}

const server = fastify()

server.register(fastifyFormbody)
server.register(fastifyMultipart)
server.delete('/*', httpCall)
server.get   ('/*', httpCall)
server.post  ('/*', httpCall)
server.put   ('/*', httpCall)

server.listen({ port: 3000 }).then()

console.log('server is listening on http://localhost:3000')
