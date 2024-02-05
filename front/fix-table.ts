
type HTMLTableFixElement = HTMLTableCellElement | HTMLTableColElement

const styleSheets = new CSSStyleSheet
document.adoptedStyleSheets.push(styleSheets)

let tables: FixTable[] = []

let tablesCounter = 0

export function applyStyleSheets()
{
	styleSheets.replaceSync(tables.map(table => table.styleSheet.join(`\n`)).join(`\n`))
}

export function fixTableBySelector(selector: string, options?: Options)
{
	return fixTableElements(document.body.querySelectorAll<HTMLTableElement>(selector), options)
}

export function fixTableElement(element: HTMLTableElement, options?: Options)
{
	return new FixTable(element, options)
}

export function fixTableElements(elements: Array<HTMLTableElement> | NodeListOf<HTMLTableElement>, options?: Options)
{
	return Array.from(elements).map(element => fixTableElement(element, options))
}

export function garbageCollector()
{
	tables = tables.filter(table => document.body.querySelectorAll<HTMLTableElement>(table.selector).length)
}

export function getTables()
{
	return tables
}

export class FixTable
{

	public readonly columns: NodeListOf<HTMLTableFixElement>

	public readonly fixColumnLeftCount: number

	public readonly fixColumnRightCount: number

	public readonly id: number

	public readonly plugins: (typeof FixTable)[] = []

	public readonly selector: string

	public readonly styleSheet: string[] = []

	constructor(public readonly element: HTMLTableElement, options?: Options)
	{
		if (options?.plugins) {
			this.plugins = options.plugins
			options.plugins.forEach(plugin => {
				Object.entries(Object.getOwnPropertyDescriptors(plugin.prototype)).forEach(([name, descriptor]) => {
					Object.defineProperty(FixTable.prototype, name, descriptor)
				})
			})
		}

		tables.push(this)
		tablesCounter ++
		if (tablesCounter > 999999999) {
			tablesCounter = 1
		}
		this.id       = tablesCounter
		this.selector = `table.itrocks[data-table-id="${this.id}"]`

		element.classList.add('itrocks')
		element.setAttribute('data-table-id', tablesCounter.toString())

		garbageCollector()

		this.columns = element.querySelectorAll<HTMLTableColElement>(':scope > colgroup > col')
		if (!this.columns.length) {
			this.columns = element.querySelectorAll<HTMLTableColElement>(':scope > thead > tr:first-child > *')
			if (!this.columns.length) {
				this.columns = element.querySelectorAll<HTMLTableColElement>(':scope > tbody > tr:first-child > *')
			}
		}
		[this.fixColumnLeftCount, this.fixColumnRightCount] = this.countColumns()
		if (this.fixColumnLeftCount)  this.fixColumnLeft()
		if (this.fixColumnRightCount) this.fixColumnRight()
		this.fixRows(element)
		this.styleSheet.push(`
			${this.selector} {
				border-collapse: separate;
			}
		`)

		this.plugins.forEach(plugin => {
			const pluginFunction: () => void = (this as any)[plugin.name]
			if (pluginFunction && (typeof pluginFunction === 'function')) {
				pluginFunction.call(this)
			}
		})

		applyStyleSheets()
	}

	protected countColumns()
	{
		let counter = 0
		let count = { first: 0, last: 0 }
		let doing: 'first' | 'last' = 'first'
		let fix = true
		this.columns.forEach(col =>
		{
			counter ++
			if (fix) {
				if (col.dataset.fix === undefined) {
					if (doing === 'last') {
						throw new Error(
							`${this.selector}: column ${counter-1} is data-fix but isolated on the middle of the table;`
							+ ' it should stick the left or the right, directly or through other data-fix columns.'
						)
					}
					fix = false
				}
			}
			else if (col.dataset.fix !== undefined) {
				doing = 'last'
				fix = true
			}
			if (fix) {
				count[doing]++
			}
		})
		return [count.first, count.last]
	}

	protected fixColumnLeft()
	{
		const bodySel: string[] = []
		const footSel: string[] = []
		const headSel: string[] = []
		let counter = 1, position = .0, width = .0
		Array.from(this.columns).toSpliced(this.fixColumnLeftCount).forEach(col => {
			position += width
			width = col.getBoundingClientRect().width
			this.styleSheet.push(`
				${this.selector} > * > tr > :nth-child(${counter}) {
					left: ${this.position(position)};
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
				z-index: 2;
			}
		`)
		this.styleSheet.push(`
			${footSel.join(', ')}, ${headSel.join(', ')} {
				z-index: 3;
			}
		`)
	}

	protected fixColumnRight()
	{
		const bodySel: string[] = []
		const footSel: string[] = []
		const headSel: string[] = []
		let counter = 1, position = .0, width = .0
		Array.from(this.columns).reverse().toSpliced(this.fixColumnRightCount).forEach(col => {
			position += width
			width = col.getBoundingClientRect().width
			this.styleSheet.push(`
				${this.selector} > * > tr > :nth-last-child(${counter}) {
					right: ${this.position(position)};
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
				z-index: 2;
			}
		`)
		this.styleSheet.push(`
			${footSel.join(', ')}, ${headSel.join(', ')} {
				z-index: 3;
			}
		`)
	}

	protected fixRows(table: HTMLTableElement)
	{
		const sections: { tfoot?: HTMLTableRowElement[], thead?: NodeListOf<HTMLTableRowElement> } = {}
		if (table.tFoot) {
			sections.tfoot = Array.from(table.querySelectorAll<HTMLTableRowElement>(':scope > tfoot > tr')).reverse()
		}
		if (table.tHead) {
			sections.thead = table.querySelectorAll<HTMLTableRowElement>(':scope > thead > tr')
		}
		Object.entries(sections).forEach(([section, rows]) =>
		{
			const [side, style] = (section === 'tfoot') ? ['-last', 'bottom'] : ['', 'top']
			let counter = 1, height = .0, position = .0
			rows.forEach(row =>
			{
				position += height
				height = row.getBoundingClientRect().height
				this.styleSheet.push(`
					${this.selector} > ${section} > tr:nth${side}-child(${counter}) > * {
						${style}: ${this.position(position, counter)};
					}
				`)
				counter ++
			})
			this.styleSheet.push(`
				${this.selector} > ${section} > tr > * {
					position: sticky;
					z-index: 1;
				}		
			`)
		})
	}

	position(position: number, _counter?: number)
	{
		return `${position}px`
	}

}

interface Options
{
	plugins?: (typeof FixTable)[]
}
