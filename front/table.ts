
export type HTMLTableFixElement = HTMLTableCellElement|HTMLTableColElement

const styleSheets = new CSSStyleSheet
document.adoptedStyleSheets.push(styleSheets)

let tableCounter    = 0
let tables: Table[] = []

export function applyStyleSheets()
{
	styleSheets.replaceSync(tables.map(table => table.styleSheet.join(`\n`)).join(`\n`))
}

export class Options
{
	[index: string]: any
	plugins: (typeof Plugin)[] = []
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

export class Plugin
{
	constructor(public table: Table) {}
	init() {}
}

export class Table
{
	readonly id:         number
	readonly onReset:    (() => void)[] = []
	readonly options =   new Options
	readonly plugins:    { [index: string]: Plugin } = {}
	readonly selector:   string
	readonly styleSheet: string[] = []

	constructor(public readonly element: HTMLTableElement, options: Partial<Options> = {})
	{
		Object.assign(this.options, options)

		this.id       = nextTableId(this)
		this.selector = `table.itrocks[data-table-id="${this.id}"]`
		this.element.classList.add('itrocks')
		this.element.setAttribute('data-table-id', this.id.toString())

		garbageCollector()
		this.constructPlugins()
		this.initPlugins()
		applyStyleSheets()
	}

	addEventListener<T extends keyof GlobalEventHandlersEventMap>(
		element:  Document|Element|Window,
		type:     T,
		listener: (this: Element, ev: GlobalEventHandlersEventMap[T]) => any,
		options?: AddEventListenerOptions|boolean
	) {
		element.addEventListener(type as string, listener as () => any, options)
		this.onReset.push(() => element.removeEventListener(type as string, listener as () => any, options))
	}

	protected constructPlugins()
	{
		this.options.plugins.forEach(pluginType => {
			this.plugins[pluginType.name] = new pluginType(this)
		})
	}

	protected initPlugins()
	{
		Object.values(this.plugins).forEach(plugin => plugin.init())
	}

	reset()
	{
		this.onReset.forEach(onReset => onReset())
		return tableByElement(this.element, this.options)
	}

	visibleInnerRect()
	{
		return this.element.getBoundingClientRect()
	}

}
export default Table

export function tableByElement(element: HTMLTableElement, options: Partial<Options> = {})
{
	return new Table(element, options)
}

export function tableByElements(
	elements: Array<HTMLTableElement>|NodeListOf<HTMLTableElement>, options: Partial<Options> = {}
) {
	return Array.from(elements).map(element => tableByElement(element, options))
}

export function tableBySelector(selector: string, options: Partial<Options> = {})
{
	return tableByElements(document.body.querySelectorAll<HTMLTableElement>(selector), options)
}
