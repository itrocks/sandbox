import './class/compose'
import 'reflect-metadata'

import fastifyCookie       from '@fastify/cookie'
import fastifyFormbody     from '@fastify/formbody'
import fastifyMultipart    from '@fastify/multipart'
import fastifySession      from '@fastify/session'
import fastify             from 'fastify'
import { FastifyReply }    from 'fastify'
import { FastifyRequest }  from 'fastify'
import { readFile, stat }  from 'node:fs/promises'
import secret              from '../local/secret'
import sessionConfig       from '../local/session'
import Action              from './action/action'
import Exception           from './action/exception'
import { needOf }          from './action/need'
import ActionRequest       from './action/request'
import { getActionModule } from './action/routes'
import staticRoutes        from './action/static-routes'
import { appPath }         from './app'
import access              from './config/access'
import { storeOf }         from './dao/store'
import { mimeTypes }       from './mime'
import { utf8Types }       from './mime'
import                          './property/filter/primitive'
import { fastifyRequest }  from './server/fastify'
import { fastifyResponse } from './server/fastify'
import Request             from './server/request'
import Response            from './server/response'
import FileStore           from './session-file-store'
import { frontScripts }    from './view/html/template'

frontScripts.push('/node_modules/air-datepicker/locale/en.js')
frontScripts.push('/node_modules/air-datepicker/locale/fr.js')
frontScripts.push('/node_modules/air-datepicker/air-datepicker.js')

async function execute(request: ActionRequest)
{
	let action: Action & { [index: string]: (request: ActionRequest) => Promise<Response> }
	let staticRoute = staticRoutes[request.request.path]
	if (staticRoute) {
		const position = staticRoute.lastIndexOf('/')
		request.route  = staticRoute.slice(0, position)
		request.action = staticRoute.slice(position + 1)
		request.format = request.request.headers['accept'].split(',')[0].split('/')[1]
		if (request.format === '*') {
			request.format = 'html'
		}
	}
	if (!request.action) {
		throw new Exception('Action is missing')
	}
	if (!request.request.session.user && !access.free.includes(request.route + '/' + request.action)) {
		request.action = 'login'
		request.route  = '/user'
		staticRoute    = undefined
	}
	try {
		action = new (require('.' + (staticRoute ?? await getActionModule(request.route, request.action))).default)
	} catch (exception) {
		console.error(exception)
		throw new Exception('Action ' + request.action + ' not found')
	}
	if (!action[request.format]) {
		throw new Exception('Action ' + request.action + ' unavailable in format ' + request.format)
	}
	const need    = needOf(action)
	const objects = storeOf(request.type) ? await request.getObjects() : []
	if (need.alternative && (need.alternative !== request.action) && (
		((need.need === 'object') && !objects.length)
		|| ((need.need === 'Store') && !storeOf(request.type))
	)) {
		request.action = need.alternative
		return execute(request)
	}
	if ((need.need === 'object') && !objects.length && !request.request.data.confirm) {
		throw new Exception('Action ' + request.action + ' needs an object')
	}
	return action[request.format](request)
}

async function httpCall(
	originRequest: FastifyRequest<{ Params: { [index: string]: string } }>,
	finalResponse: FastifyReply
)
{
	const request = await fastifyRequest(originRequest)
	const dot = request.path.lastIndexOf('.') + 1
	if ((dot > request.path.length - 6) && !request.path.includes('./')) {
		const fileExtension = request.path.substring(dot)
		if (
			!['js', 'ts'].includes(fileExtension)
			|| request.path.startsWith('/front/')
			|| frontScripts.includes(request.path)
		) {
			const filePath = (request.path === '/favicon.ico') ? '/app/style/2020/logo/favicon.ico' : request.path
			const mimeType = mimeTypes.get(fileExtension)
			if (mimeType) {
				return fastifyResponse(finalResponse, await httpAsset(request, appPath + filePath, mimeType))
			}
		}
	}
	try {
		return fastifyResponse(finalResponse, await execute(new ActionRequest(request)))
	} catch (exception) {
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
	const ifModified = request.headers['if-modified-since']
	const lastModified = new Date((await stat(filePath)).mtime)
	if (ifModified && (new Date(ifModified) >= lastModified)) {
		return new Response('', 304)
	}
	const utf8Type = utf8Types.has(mimeType)
	const headers = {
		'Content-Type': mimeType + (utf8Type ? '; charset=utf-8' : ''),
		'Last-Modified': lastModified.toUTCString()
	}
	return new Response(await readFile(filePath, utf8Type ? 'utf-8' : undefined), 200, headers)
}

const server = fastify({ trustProxy: true })

server.register(fastifyCookie)
server.register(fastifyFormbody)
server.register(fastifyMultipart)
server.register(fastifySession, {
	cookie:            { maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'strict', secure: false },
	cookieName:        'itrSid',
	saveUninitialized: false,
	secret,
	store:             new FileStore(sessionConfig.path)
})
server.delete('/*', httpCall)
server.get   ('/*', httpCall)
server.post  ('/*', httpCall)
server.put   ('/*', httpCall)

server.listen({ port: 3000 }).then()

console.log('server is listening on http://localhost:3000')
