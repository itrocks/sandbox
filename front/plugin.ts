
export class HasPlugins<O extends object>
{
	readonly options = new Options<O>
	readonly plugins = {} as Plugins<O>

	constructor(options: Partial<Options<O>> = {})
	{
		Object.assign(this.options, options)
	}

	protected constructPlugins()
	{
		for (const pluginType of this.options.plugins) {
			this.plugins[pluginType.name] = new pluginType(this as unknown as O)
		}
	}

	protected initPlugins()
	{
		for (const plugin of Object.values(this.plugins)) {
			plugin.init()
		}
	}

}

export class Options<O extends object>
{
	[index: string]: any
	plugins: (typeof Plugin<O>)[] = []
}

export default class Plugin<O extends object>
{
	constructor(public of: O) {}
	init() {}
}
export { Plugin }

export type Plugins<O extends object> = { [index: string]: Plugin<O> }
