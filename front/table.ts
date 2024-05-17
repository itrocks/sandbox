import { HasPlugins, Options as PluginOptions } from './plugin.js'

export type HTMLTableFixElement = HTMLTableCellElement | HTMLTableColElement

const styleSheets = new CSSStyleSheet
document.adoptedStyleSheets.push(styleSheets)

let tableCounter = 0
let tables       = [] as Table[]

export function applyStyleSheets()
{
	styleSheets.replaceSync(tables.map(table => table.styleSheet.join(`\n`)).join(`\n`))
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

export type Options = PluginOptions<Table>

export class Table extends HasPlugins<Table>
{
	readonly id:       number
	readonly selector: string

	readonly onReset    = [] as (() => void)[]
	readonly styleSheet = [] as string[]

	constructor(public readonly element: HTMLTableElement, options: Partial<Options> = {})
	{
		super(options)

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
		element:  Document | Element | Window,
		type:     T,
		listener: (this: Element, ev: GlobalEventHandlersEventMap[T]) => any,
		options?: AddEventListenerOptions | boolean
	) {
		element.addEventListener(type as string, listener as () => any, options)
		this.onReset.push(() => element.removeEventListener(type as string, listener as () => any, options))
	}

	cellColumnNumber(cell: HTMLTableCellElement)
	{
		let count    = 0
		let previous = cell.previousElementSibling
		while (previous) {
			if ((previous.tagName === 'TD') || (previous.tagName === 'TH')) {
				count ++
			}
			previous = previous.previousElementSibling
		}
		return count
	}

	reset()
	{
		for (const onReset of this.onReset) onReset.call(this)
		return tableByElement(this.element, this.options)
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
