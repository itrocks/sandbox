
export type HTMLTableFixElement = HTMLTableCellElement | HTMLTableColElement

const styleSheets = new CSSStyleSheet
document.adoptedStyleSheets.push(styleSheets)

let tableCounter = 0

let tables: Table[] = []

export function applyStyleSheets()
{
	styleSheets.replaceSync(tables.map(table => table.styleSheet.join(`\n`)).join(`\n`))
}

export class TableOptions
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
	readonly id: number
	readonly onReset: (() => void)[] = []
	readonly options = new TableOptions
	readonly selector: string
	readonly styleSheet: string[] = []

	constructor(public readonly element: HTMLTableElement, options: Partial<TableOptions> = {})
	{
		Object.assign(this.options, options)

		this.applyPlugins()

		this.id       = nextTableId(this)
		this.selector = `table.itrocks[data-table-id="${this.id}"]`
		this.element.classList.add('itrocks')
		this.element.setAttribute('data-table-id', this.id.toString())

		garbageCollector()
		this.executePlugins('Init')
		this.executePlugins()
		applyStyleSheets()
	}

	addEventListener<T extends keyof GlobalEventHandlersEventMap>(
		element:  Document|Element,
		type:     T,
		listener: (this: Element, ev: GlobalEventHandlersEventMap[T]) => any,
		options?: boolean | AddEventListenerOptions
	) {
		element.addEventListener(type as string, listener as () => any, options)
		this.onReset.push(() => element.removeEventListener(type as string, listener as () => any, options))
	}

	protected applyPlugins()
	{
		const alreadyDefined: { [index: string]: typeof Table } = {}
		this.options.plugins.forEach(plugin => {
			Object.entries(plugin.defaultOptions()).forEach(([index, value]) => {
				if (!this.options.hasOwnProperty(index)) {
					this.options[index] = value
				}
			})
			Object.entries(Object.getOwnPropertyDescriptors(plugin.prototype)).forEach(([name, descriptor]) => {
				if (name === 'constructor') return
				let found  = false
				let parent = plugin
				while (parent.constructor !== Object) {
					parent = Object.getPrototypeOf(parent)
					if (parent === alreadyDefined[name]) {
						found = true
						break
					}
				}
				if (alreadyDefined[name] && !found) {
					throw 'Function collision: ' + name
						+ ' defined into ' + plugin.name
						+ ' has already be defined into ' + alreadyDefined[name].name
				}
				alreadyDefined[name] = plugin
				Object.defineProperty(Table.prototype, name, descriptor)
			})
		})
	}

	static defaultOptions()
	{
		return new TableOptions
	}

	protected executePlugins(methodSuffix = '')
	{
		this.options.plugins.forEach(plugin => {
			const pluginFunction: () => void = (this as any)[plugin.name + methodSuffix]
			if (pluginFunction && (typeof pluginFunction === 'function')) {
				pluginFunction.call(this)
			}
		})
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

export function tableBySelector(selector: string, options: Partial<TableOptions> = {})
{
	return tableByElements(document.body.querySelectorAll<HTMLTableElement>(selector), options)
}

export function tableByElement(element: HTMLTableElement, options: Partial<TableOptions> = {})
{
	return new Table(element, options)
}

export function tableByElements(
	elements: Array<HTMLTableElement> | NodeListOf<HTMLTableElement>, options: Partial<TableOptions> = {}
) {
	return Array.from(elements).map(element => tableByElement(element, options))
}
