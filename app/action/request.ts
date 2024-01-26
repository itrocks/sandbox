import Type          from '../class/type'
import dao           from '../dao/dao'
import ServerRequest from '../server/request'
import Exception     from './exception'
import routes        from './routes'

export default class Request
{

	action: string

	ids: string[]

	objects: object[] = []

	route: string

	constructor(public request: ServerRequest)
	{
		const [route, action, ids] = this.parsePath()
		this.route  = route
		this.action = action
		this.ids    = ids
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

	protected parsePath(): [string, string, string[]]
	{
		const [route, action, ids] = this.splitPath(this.request.path)
		return [
			route.substring(1),
			action.substring(1),
			ids.split('/').slice(1)
		]
	}

	protected splitPath(path: string): string[]
	{
		const match = path.replaceAll('-', '_').match(
			/^(?<class>(?:\/[A-Za-z_][A-Za-z0-9_]*)+)(?<action>\/[A-Za-z_][A-Za-z0-9_]*)(?<id>(?:\/[0-9]+)*)?$/
		)
		if (match === null) {
			return ['', '', '']
		}
		if (!match[3]) {
			match[3] = ''
		}
		return match.slice(1)
	}

}
