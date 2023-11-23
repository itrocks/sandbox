import dao from '../dao/dao'
import Exception from './exception'
import routes from './routes'
import Type from '../class/type'

export default class extends Request
{

	action: string

	ids: number[]

	objects: object[] = []

	route: string

	constructor(request: Request)
	{
		super(request)
		const [route, action, ids] = this.parseUrl()
		this.route  = route
		this.action = action
		this.ids    = ids
	}

	get module(): object|string|undefined
	{
		let route: {[name: string]: any} = routes
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

	get object(): object
	{
		return this.objects[0]
	}

	get type(): Type
	{
		if (!this.module) {
			throw new Exception('Module ' + this.route + ' not found', 404)
		}
		try {
			return require('..' + this.module).default
		}
		catch {
			throw new Exception('Module ' + this.route + ' not found', 404)
		}
	}

	getObjects(): Promise<object[]>
	{
		this.objects = []
		const type   = this.type
		return Promise.all(this.ids.map(id => dao.read(type, id).then(object => {
			this.objects.push(object)
			return object
		})))
	}

	protected parseUrl(): [string, string, number[]]
	{
		const url = new URL(this.url)
		const [route, action, ids] = this.splitPath(url.pathname)
		return [
			route.substring(1),
			action.substring(1),
			ids.split('/').slice(1).map<number>((ids: string) => parseInt(ids))
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
