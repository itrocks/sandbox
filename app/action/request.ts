import { dao, Entity }    from '../dao/dao'
import ServerRequest      from '../server/request'
import Exception          from './exception'
import formats            from './formats'
import { Routes, routes } from './routes'

export default class Request
{
	action  = ''
	format  = ''
	ids     = [] as string[]
	objects = [] as (object & Entity)[]
	route   = ''

	constructor(public request: ServerRequest)
	{
		Object.assign(this, this.parsePath())
	}

	getModule()
	{
		let route: Routes | string = routes
		for (const name of this.route.substring(1).split('/').reverse()) {
			if (typeof route === 'string') return undefined
			const routeStep = route[name] as Routes | string | undefined
			if (!routeStep) break
			route = routeStep
		}
		if ((typeof route === 'object') && route[':']) {
			route = route['-']
		}
		return (route === routes) ? undefined : route
	}

	get object()
	{
		return this.objects[0]
	}

	getType()
	{
		const module = this.getModule()
		if (!module) {
			throw new Exception('Module ' + this.route.substring(1) + ' not found')
		}
		const type = require('..' + module).default
		if (typeof type !== 'function') {
			throw new Exception('Module ' + this.route.substring(1) + ' default is not a class')
		}
		return type
	}

	async getObjects()
	{
		this.objects = []
		const type = this.getType()
		return Promise.all(this.ids.map(async id => {
			const object = await dao.read(type, id)
			this.objects.push(object)
			return object
		}))
	}

	parsePath(): Partial<Request>
	{
		const route  = '(?<route>(?:/[A-Za-z][A-Za-z0-9]*)+)'
		const id     = '(?:/(?<id>(?!,)(?:,?[0-9]+)+))'
		const action = '(?:/(?<action>[A-Za-z]+))'
		const format = '(?:/(?<format>[A-Za-z]+))'

		const request = this.request
		const method  = request.method
		const regExp  = (method === 'GET')
			? `^${route}${id}?${action}?${format}?$`
			: (method === 'POST')
				? `^${route}${format}?$`
				// method === any of 'DELETE' | 'PATCH' | 'PUT'
				: `^${route}${id}${action}?${format}?$`
		const match = request.path.replaceAll('-', '_').match(new RegExp(regExp))
		if (!match?.groups) {
			return {}
		}
		type Groups = { action?: string, format?: string, id?: string, route: string }
		const path: Partial<Request> & Groups = match.groups as Groups

		// ids <- id
		path.ids = path.id?.split(',') ?? []
		delete path.id

		if (!path.format) {
			// format <- action
			if (path.action && formats.find(([isFormat]) => path.action === isFormat)) {
				path.format = path.action
				path.action = ''
			}
			else {
				// format <- route
				const position = path.route.lastIndexOf('/')
				const format   = path.route.substring(position + 1)
				if (formats.find(([isFormat]) => format === isFormat)) {
					path.format = format
					path.route = path.route.substring(0, position)
				}
				// format <- accept
				else if (request.headers.accept) {
					for (const acceptMime of request.headers.accept.split(',')) {
						const format = formats.find(([, mime]) => acceptMime === mime)
						if (format) {
							path.format = format[0]
							break
						}
					}
				}
			}
			// format <- default
			if (!path.format) {
				path.format = 'html'
			}
		}

		if (!path.action) {
			// action <- method
			if (path.ids.length) {
				if (method === 'DELETE') {
					path.action = 'delete'
				}
				else if (method === 'GET') {
					path.action = 'output'
				}
				else if ((method === 'PATCH') || (method === 'PUT')) {
					path.action = 'save'
				}
			}
			else if (method === 'POST') {
				path.action = 'save'
			}
			// action <- route
			else if (path.route.lastIndexOf('/') > 0) {
				const position = path.route.lastIndexOf('/')
				path.action    = path.route.substring(position + 1)
				path.route     = path.route.substring(0, position)
			}
			// action <- default
			else {
				path.action = 'list'
			}
		}

		return path.route ? path : {}
	}

}
