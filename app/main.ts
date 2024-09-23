import './class/compose'
import 'reflect-metadata'

import fastifyCookie                       from '@fastify/cookie'
import fastifyFormbody                     from '@fastify/formbody'
import fastifyMultipart                    from '@fastify/multipart'
import fastifySession                      from '@fastify/session'
import fastify                             from 'fastify'
import { FastifyReply, FastifyRequest }    from 'fastify'
import { readFile, stat }                  from 'node:fs/promises'
import secret                              from '../local/secret'
import Action                              from './action/action'
import Exception                           from './action/exception'
import { needOf }                          from './action/need'
import ActionRequest                       from './action/request'
import { getActionModule }                 from './action/routes'
import { appPath }                         from './app'
import { storeOf }                         from './dao/store'
import { mimeTypes, utf8Types }            from './mime'
import                                          './property/filter/primitive'
import { fastifyRequest, fastifyResponse } from './server/fastify'
import Request                             from './server/request'
import Response                            from './server/response'
import { frontScripts }                    from './view/html/template'

async function execute(request: ActionRequest)
{
	let action: Action & { [index: string]: (request: ActionRequest) => Promise<Response> }
	if (!request.action) {
		throw new Exception('Action is missing')
	}
	try {
		action = new (require('.' + await getActionModule(request.route, request.action)).default)
	}
	catch (exception) {
		console.error(exception)
		throw new Exception('Action ' + request.action + ' not found')
	}
	if (!action[request.format]) {
		throw new Exception('Action ' + request.action + ' unavailable in format ' + request.format)
	}
	const need    = needOf(action)
	const objects = storeOf(request.type) ? await request.getObjects() : []
	if (need.alternative && (
		((need.need === 'object') && !objects.length)
		|| ((need.need === 'Store') && !storeOf(request.type))
	)) {
		request.action = need.alternative
		return execute(request)
	}
	if ((need.need === 'object') && !objects.length) {
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

const server = fastify({ trustProxy: true })

server.register(fastifyCookie)
server.register(fastifyFormbody)
server.register(fastifyMultipart)
server.register(fastifySession, { cookie: { secure: false }, cookieName: 'itrS', saveUninitialized: false, secret })
server.delete('/*', httpCall)
server.get   ('/*', httpCall)
server.post  ('/*', httpCall)
server.put   ('/*', httpCall)

server.listen({ port: 3000 }).then()

console.log('server is listening on http://localhost:3000')
