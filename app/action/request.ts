import { StringObject, Type } from '../class/type'
import { dao, HasEntity }     from '../dao/dao'
import ServerRequest          from '../server/request'
import Exception              from './exception'
import formats                from './formats'
import { getModule }          from './routes'

export default class Request<T extends object = object>
{
	action                     = ''
	format                     = ''
	ids:     string[]          = []
	objects: (HasEntity & T)[] = []
	route                      = ''

	constructor(public request: ServerRequest)
	{
		Object.assign(this, this.parsePath())
	}

	get object()
	{
		return this.objects.length ? this.objects[0] : undefined
	}

	get type(): Type<T>
	{
		const module = getModule(this.route)
		if (!module) return class {} as Type<T>

		const type = require('..' + module).default
		if ((typeof type)[0] !== 'f') {
			throw new Exception('Module ' + this.route.substring(1) + ' default is not a class')
		}
		Object.defineProperty(this, 'type', { value: type })
		return type
	}

	async getObjects()
	{
		this.objects = []
		const type = this.type
		return Promise.all(this.ids.map(async id => {
			const object = await dao.read(type, id)
			this.objects.push(object)
			return object
		}))
	}

	parsePath(): Partial<Request<T>>
	{
		const route  = '(?<route>(?:/[A-Za-z][A-Za-z0-9]*)+)'
		const id     = '(?:/(?<id>(?!,)(?:,?[0-9]+)+))'
		const action = '(?:/(?<action>[A-Za-z]+))'
		const format = '(?:/(?<format>[A-Za-z]+))'

		const request = this.request
		const method  = request.method
		const regExp  = `^${route}${id}?${action}?${format}?$`
		const match   = request.path.replaceAll('-', '_').match(new RegExp(regExp))
		if (!match?.groups) {
			return {}
		}
		type Groups = { action?: string, format?: string, id?: string, route: string }
		const path: Partial<Request<T>> & Groups = match.groups as Groups

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
			const method0 = method[0]
			if (path.ids.length) {
				switch (method0) {
					case 'D': path.action = 'delete'; break
					case 'G': path.action = 'output'; break
					case 'P': path.action = 'save'
				}
			}
			else if ((method0 === 'P') && (path.format === 'json')) {
				path.action = 'save'
				if (path.route.endsWith('/save')) {
					path.route = path.route.substring(0, path.route.lastIndexOf('/'))
				}
			}
			// action <- route
			else if (path.route.lastIndexOf('/') > 0) {
				const position = path.route.lastIndexOf('/')
				path.action    = path.route.substring(position + 1)
				path.route     = path.route.substring(0, position)
			}
			// action <- default
			else {
				switch (method0) {
					case 'D': path.action = 'delete'; break
					case 'G': path.action = 'list';   break
					case 'P': path.action = 'save'
				}
			}
		}

		const dataId = request.data.id
		if (dataId) {
			delete request.data.id
			if (typeof dataId === 'string') {
				path.ids.push(...dataId.split(','))
			}
			else if (Array.isArray(dataId)) {
				path.ids.push(...(dataId as string[]))
			}
			else if (typeof dataId === 'object') {
				path.ids.push(...Object.values(dataId as StringObject))
			}
			else {
				request.data.id = dataId
			}
		}

		return path.route ? path : {}
	}

}
