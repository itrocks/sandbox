
export type HTMLTableFixElement = HTMLTableCellElement | HTMLTableColElement

const styleSheets = new CSSStyleSheet
document.adoptedStyleSheets.push(styleSheets)

let tableCounter = 0

let tables: FixTable[] = []

export function applyStyleSheets()
{
	styleSheets.replaceSync(tables.map(table => table.styleSheet.join(`\n`)).join(`\n`))
}

export function fixTableBySelector(selector: string, options: Options = {})
{
	return fixTableElements(document.body.querySelectorAll<HTMLTableElement>(selector), options)
}

export function fixTableElement(element: HTMLTableElement, options: Options = {})
{
	return new FixTable(element, options)
}

export function fixTableElements(
	elements: Array<HTMLTableElement> | NodeListOf<HTMLTableElement>, options: Options = {}
) {
	return Array.from(elements).map(element => fixTableElement(element, options))
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

function nextTableId(table: FixTable)
{
	tables.push(table)
	tableCounter ++
	if (tableCounter > 999999999) {
		tableCounter = 1
	}
	return tableCounter
}

export class FixTable
{

	public readonly borderCollapse: 0|1

	public readonly columns: NodeListOf<HTMLTableFixElement>

	public readonly id: number

	public readonly leftColumnCount: number

	public readonly options = new DefaultOptions

	public readonly rightColumnCount: number

	public readonly selector: string

	public readonly styleSheet: string[] = []

	constructor(public readonly element: HTMLTableElement, options: Options = {})
	{
		Object.assign(this.options, options)

		this.applyPlugins()

		this.id       = nextTableId(this)
		this.selector = `table.itrocks[data-table-id="${this.id}"]`
		this.element.classList.add('itrocks')
		this.element.setAttribute('data-table-id', this.id.toString())
		garbageCollector()
		this.borderCollapse = (getComputedStyle(this.element).borderCollapse === 'collapse') ? 1 : 0
		this.commonStyle()

		this.columns          = this.getColumns()
		this.leftColumnCount  = this.countLeftColumns()
		this.rightColumnCount = this.countRightColumns()
		this.fixFootRows()
		this.fixHeadRows()
		this.fixLeftColumns()
		this.fixRightColumns()

		this.executePluginConstructors()

		applyStyleSheets()
	}

	protected applyPlugins()
	{
		this.options.plugins.forEach(plugin => {
			Object.entries(Object.getOwnPropertyDescriptors(plugin.prototype)).forEach(([name, descriptor]) => {
				Object.defineProperty(FixTable.prototype, name, descriptor)
			})
		})
	}

	protected commonStyle()
	{
		if (!this.borderCollapse) return
		this.styleSheet.push(`
			${this.selector} {
				border-collapse: separate;
				border-spacing: 0;
			}
		`)
	}

	protected countLeftColumns()
	{
		let count = 0
		while ((count < this.columns.length - 1) && (this.columns[count].dataset.fix !== undefined)) {
			count ++
		}
		return count
	}

	protected countRightColumns()
	{
		let count = this.columns.length - 1
		while ((count > 0) && (this.columns[count].dataset.fix !== undefined)) {
			count --
		}
		return this.columns.length - 1 - count
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

	protected fixFootRows()
	{
		if (!this.element.tFoot) return
		let counter = 1, bottom = .0, previousBottom = this.element.getBoundingClientRect().bottom
		Array.from(this.element.tFoot.querySelectorAll<HTMLTableRowElement>(':scope > tr')).reverse().forEach(row => {
			const actualBottom = row.getBoundingClientRect().bottom
			bottom += previousBottom - actualBottom
			previousBottom = actualBottom
			this.styleSheet.push(`
				${this.selector} > tfoot > tr:nth-last-child(${counter}) > * {
					bottom: ${this.position(bottom, counter, row.firstElementChild as HTMLTableCellElement, 'bottom')};
				}
			`)
			counter ++
		})
		this.styleSheet.push(`
			${this.selector} > tfoot > tr > * {
				position: sticky;
				z-index: ${this.options.rowIndex};
			}		
		`)
	}

	protected fixHeadRows()
	{
		if (!this.element.tHead) return
		let counter = 1, top = .0, previousTop = this.element.getBoundingClientRect().top
		this.element.tHead.querySelectorAll<HTMLTableRowElement>(':scope > tr').forEach(row => {
			const actualTop = row.getBoundingClientRect().top
			top += actualTop - previousTop
			previousTop = actualTop
			this.styleSheet.push(`
				${this.selector} > thead > tr:nth-child(${counter}) > * {
					top: ${this.position(top, counter, row.firstElementChild as HTMLTableCellElement, 'top')};
				}
			`)
			counter ++
		})
		this.styleSheet.push(`
			${this.selector} > thead > tr > * {
				position: sticky;
				z-index: ${this.options.rowIndex};
			}		
		`)
	}

	protected fixLeftColumns()
	{
		if (!this.leftColumnCount) return
		const bodySel: string[] = []
		const footSel: string[] = []
		const headSel: string[] = []
		let counter = 1, left = .0, previousLeft = this.element.getBoundingClientRect().left
		Array.from(this.columns).toSpliced(this.leftColumnCount).forEach(col => {
			const actualLeft = col.getBoundingClientRect().left
			left += actualLeft - previousLeft
			previousLeft = actualLeft
			this.styleSheet.push(`
				${this.selector} > * > tr > :nth-child(${counter}) {
					left: ${this.position(left, counter, col, 'left')};
				}
			`)
			bodySel.push(`${this.selector} > tbody > tr > :nth-child(${counter})`)
			footSel.push(`${this.selector} > tfoot > tr > :nth-child(${counter})`)
			headSel.push(`${this.selector} > thead > tr > :nth-child(${counter})`)
			counter ++
		})
		this.styleSheet.push(`
			${bodySel.join(', ')} {
				position: sticky;
				z-index: ${this.options.colIndex};
			}
			${footSel.join(', ')}, ${headSel.join(', ')} {
				z-index: ${this.options.cornerIndex};
			}
		`)
	}

	protected fixRightColumns()
	{
		if (!this.rightColumnCount) return
		const bodySel: string[] = []
		const footSel: string[] = []
		const headSel: string[] = []
		let counter = 1, right = .0, previousRight = this.element.getBoundingClientRect().right
		Array.from(this.columns).reverse().toSpliced(this.rightColumnCount).forEach(col => {
			const actualRight = col.getBoundingClientRect().right
			right += previousRight - actualRight
			previousRight = actualRight
			this.styleSheet.push(`
				${this.selector} > * > tr > :nth-last-child(${counter}) {
					right: ${this.position(right, counter, col, 'right')};
				}
			`)
			bodySel.push(`${this.selector} > tbody > tr > :nth-last-child(${counter})`)
			footSel.push(`${this.selector} > tfoot > tr > :nth-last-child(${counter})`)
			headSel.push(`${this.selector} > thead > tr > :nth-last-child(${counter})`)
			counter ++
		})
		this.styleSheet.push(`
			${bodySel.join(', ')} {
				position: sticky;
				z-index: ${this.options.colIndex};
			}
			${footSel.join(', ')}, ${headSel.join(', ')} {
				z-index: ${this.options.cornerIndex};
			}
		`)
	}

	protected getColumns()
	{
		let columns = this.element.querySelectorAll<HTMLTableColElement>(':scope > colgroup > col')
		if (!columns.length) {
			columns = this.element.querySelectorAll<HTMLTableColElement>(':scope > thead > tr:first-child > *')
			if (!columns.length) {
				columns = this.element.querySelectorAll<HTMLTableColElement>(':scope > tbody > tr:first-child > *')
			}
		}
		return columns
	}

	protected position(
		position: number,
		_counter: number,
		_row: HTMLTableFixElement,
		_side: 'bottom' | 'left' | 'right' | 'top'
	) {
		return `${position}px`
	}

}

interface Options
{
	colIndex?:    number
	cornerIndex?: number
	plugins?:     (typeof FixTable)[]
	rowIndex?:    number
}

class DefaultOptions implements Options
{
	colIndex:    number = 2
	cornerIndex: number = 3
	plugins:     (typeof FixTable)[] = []
	rowIndex:    number = 1
}

export default FixTable
