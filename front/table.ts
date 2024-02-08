
export type HTMLTableFixElement = HTMLTableCellElement | HTMLTableColElement

const styleSheets = new CSSStyleSheet
document.adoptedStyleSheets.push(styleSheets)

let tableCounter = 0

let tables: Table[] = []

export function applyStyleSheets()
{
	styleSheets.replaceSync(tables.map(table => table.styleSheet.join(`\n`)).join(`\n`))
}

export class Options
{
	[index: string]: any
	plugins: (typeof Table)[] = []
}

export function garbageCollector()
{
	const length = tables.length
	tables = tables.filter(table => document.body.querySelectorAll<HTMLTableElement>(table.selector).length)
	if (tables.length < length) {
		applyStyleSheets()
	}
}

export function getTables()
{
	return tables
}

function nextTableId(table: Table)
{
	tables.push(table)
	tableCounter ++
	if (tableCounter > 999999999) {
		tableCounter = 1
	}
	return tableCounter
}

export class Table
{

	public readonly id: number
	public readonly options = new Options
	public readonly selector: string
	public readonly styleSheet: string[] = []

	constructor(public readonly element: HTMLTableElement, options: Partial<Options> = {})
	{
		Object.assign(this.options, options)

		this.applyPlugins()

		this.id       = nextTableId(this)
		this.selector = `table.itrocks[data-table-id="${this.id}"]`
		this.element.classList.add('itrocks')
		this.element.setAttribute('data-table-id', this.id.toString())

		garbageCollector()
		this.executePluginConstructors()
		applyStyleSheets()
	}

	protected applyPlugins()
	{
		this.options.plugins.forEach(plugin => {
			Object.entries(plugin.defaultOptions()).forEach(([index, value]) => {
				if (!this.options.hasOwnProperty(index)) {
					this.options[index] = value
				}
			})
			Object.entries(Object.getOwnPropertyDescriptors(plugin.prototype)).forEach(([name, descriptor]) => {
				Object.defineProperty(Table.prototype, name, descriptor)
			})
		})
	}
	public static defaultOptions()
	{
		return new Options
	}

	protected executePluginConstructors()
	{
		this.options.plugins.forEach(plugin => {
			const pluginFunction: () => void = (this as any)[plugin.name]
			if (pluginFunction && (typeof pluginFunction === 'function')) {
				pluginFunction.call(this)
			}
		})
	}

}

export function tableBySelector(selector: string, options: Partial<Options> = {})
{
	return tableElements(document.body.querySelectorAll<HTMLTableElement>(selector), options)
}

export function tableElement(element: HTMLTableElement, options: Partial<Options> = {})
{
	return new Table(element, options)
}

export function tableElements(
	elements: Array<HTMLTableElement> | NodeListOf<HTMLTableElement>, options: Partial<Options> = {}
) {
	return Array.from(elements).map(element => tableElement(element, options))
}

export default Table
