import Type          from '../class/type'
import dao           from '../dao/dao'
import ServerRequest from '../server/request'
import Exception     from './exception'
import formats       from './formats'
import routes        from './routes'

export default class Request
{
	action:  string = ''
	format:  string = ''
	ids:     string[] = []
	objects: object[] = []
	route:   string = ''

	constructor(public request: ServerRequest)
	{
		Object.assign(this, this.parsePath())
	}

	getModule(): object|string|undefined
	{
		let route: { [name: string]: any } = routes
		this.route.split('/').reverse().forEach(name => {
			if (!route[name]) {
				return false
			}
			route = route[name]
		})
		if ((typeof route === 'object') && route[':']) {
			route = route['-']
		}
		return (route === routes) ? undefined : route
	}

	get object(): { [property: string]: any }
	{
		return this.objects[0]
	}

	getType(): Type
	{
		const module = this.getModule()
		if (!module) {
			throw new Exception('Module ' + this.route + ' not found')
		}
		return require('..' + module).default
	}

	async getObjects(): Promise<object[]>
	{
		this.objects = []
		const type = this.getType()
		return Promise.all(this.ids.map(async id => {
			const object = await dao.read(type, id)
			this.objects.push(object)
			return object
		}))
	}

	protected parsePath(): Partial<Request>
	{
		const route  = '(?<route>(?:\\/[A-Za-z_][A-Za-z0-9_]*)+)'
		const id     = '(?<id>\\/(?!,)(?:,?[0-9*?]+)+)'
		const action = '(?<action>\\/[A-Za-z_][A-Za-z0-9_]*)'
		const format = '(?<format>\\/[A-Za-z_]+)'

		const request = this.request
		const method  = request.method
		const regExp  = (method === 'GET')
			? `^${route}${id}?${action}?${format}?$`
			: (method === 'POST')
				? `^${route}?${format}$`
				// this.request.method === any of 'DELETE' | 'PATH' | 'PUT'
				: `^${route}${id}${action}?${format}?$`
		const match = request.path.replaceAll('-', '_').match(new RegExp(regExp))
		if (!match?.groups) {
			return {}
		}
		type Groups = { action?: string, format?: string, id?: string, route?: string }
		const path: Partial<Request> & Groups = match.groups as Groups

		console.log(path)

		// id
		path.ids = path.id?.substring(1).split(',') ?? []
		delete path.id

		// route
		if (path.format && !path.route) {
			path.route = path.format
			delete path.format
		}

		// format <- action
		if (path.action && !path.format && formats.find(([format]) => format === path.action?.substring(1))) {
			path.format = path.action
			path.action = ''
		}

		// action <- format
		if (path.format && (!path.action || !path.ids.length) && !formats.find(([format]) => format === path.format?.substring(1))) {
			if (path.action) {
				path.route += path.action
			}
			path.action = path.format
			delete path.format
		}

		if (path.route && !path.action) {
			// action <- method
			if (method === 'DELETE') {
				path.action = '/delete'
			}
			else if (method.startsWith('P')) { // PATCH, POST, PUT
				path.action = '/save'
			}
			// action & format <- route
			else if (method === 'GET') {
				const parts = path.route.split('/')
				if (!path.format && (parts.length > 2) && formats.find(([format]) => format === parts[parts.length - 1])) {
					path.format = '/' + parts.pop()
				}
				if (parts.length > 2) {
					path.action = '/' + parts.pop()
				}
				path.route = parts.join('/')
			}
		}

		// default action
		if (!path.action) {
			path.action = path.ids.length
				? '/output'
				: '/list'
		}

		if (!path.format) {
			// format <- accept
			if (request.headers.accept) {
				for (const acceptMime of request.headers.accept.split(',')) {
					const format = formats.find(([,mime]) => acceptMime === mime)
					if (format) {
						path.format = '/' + format[0]
						break
					}
				}
			}
			// default format
			if (!path.format) {
				path.format = '/html'
			}
		}

		path.route  = path.route?.substring(1)  ?? ''
		path.action = path.action?.substring(1) ?? ''
		path.format = path.format?.substring(1) ?? ''

		console.log(path)

		return path
	}

}
