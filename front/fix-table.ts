import loadCss from './load-css.js'

await loadCss(import.meta.url)

type HTMLTableFixElement = HTMLTableCellElement|HTMLTableColElement

let tables: FixTable[] = []

let tablesCounter = 0

export function fixTableBySelector(selector: string)
{
	return fixTableElements(document.body.querySelectorAll<HTMLTableElement>(selector))
}

export function fixTableElement(element: HTMLTableElement)
{
	return new FixTable(element)
}

export function fixTableElements(elements: Array<HTMLTableElement>|NodeListOf<HTMLTableElement>)
{
	return Array.from(elements).map(element => fixTableElement(element))
}

export function garbageCollector()
{
	tables = tables.filter(table => {
		if (document.body.querySelectorAll<HTMLTableElement>(table.selector).length) {
			return true
		}
		table.disableStyleSheet()
		return false
	})
}

export function getTables()
{
	return tables
}

export class FixTable
{

	public readonly id: number

	public readonly selector: string

	public readonly styleSheet = new CSSStyleSheet

	constructor(public readonly element: HTMLTableElement)
	{
		garbageCollector()
		tables.push(this)
		tablesCounter ++
		if (tablesCounter > 999999999) {
			tablesCounter = 1
		}
		this.id       = tablesCounter
		this.selector = `table.itrocks[data-table-id="${this.id}"]`

		element.classList.add('itrocks')
		element.setAttribute('data-table-id', tablesCounter.toString())
		let elements: NodeListOf<HTMLTableFixElement>
		elements = element.querySelectorAll<HTMLTableColElement>(':scope > colgroup > col')
		if (!elements.length) {
			elements = element.querySelectorAll<HTMLTableColElement>(':scope > thead > tr:first-child > *')
			if (!elements.length) {
				elements = element.querySelectorAll<HTMLTableColElement>(':scope > tbody > tr:first-child > *')
			}
		}
		this.fixColumns(elements)
		this.fixRows(element)
		document.adoptedStyleSheets.push(this.styleSheet)
	}

	protected countColumns(cols: NodeListOf<HTMLTableFixElement>)
	{
		let counter = 0
		let count = { first: 0, last: 0 }
		let doing: 'first'|'last' = 'first'
		let fix = true
		cols.forEach(col =>
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
		return count
	}

	disableStyleSheet()
	{
		document.adoptedStyleSheets = document.adoptedStyleSheets.filter(styleSheet => styleSheet !== this.styleSheet)
	}

	enableStyleSheet()
	{
		if (!document.adoptedStyleSheets.find(stylesheet => stylesheet === this.styleSheet)) {
			document.adoptedStyleSheets.push(this.styleSheet)
		}
	}

	protected fixColumns(cols: NodeListOf<HTMLTableFixElement>)
	{
		const { first, last } = this.countColumns(cols)
		if (first) this.fixFirstColumns(cols, first)
		if (last)  this.fixLastColumns(cols, last)
	}

	protected fixFirstColumns(cols: NodeListOf<HTMLTableFixElement>, count: number)
	{
		const bodySel: string[] = []
		const footSel: string[] = []
		const headSel: string[] = []
		let counter = 1, position = .0, width = .0
		Array.from(cols).toSpliced(count).forEach(col => {
			position += width
			width = col.getBoundingClientRect().width
			this.styleSheet.insertRule(`
				${this.selector} > * > tr > :nth-child(${counter}) {
					left: ${position}px;
				}
			`)
			bodySel.push(`${this.selector} > tbody > tr > :nth-child(${counter})`)
			footSel.push(`${this.selector} > tfoot > tr > :nth-child(${counter})`)
			headSel.push(`${this.selector} > thead > tr > :nth-child(${counter})`)
			counter ++
		})
		this.styleSheet.insertRule(`
			${bodySel.join(', ')} {
				position: sticky;
				z-index: 2;
			}
		`)
		this.styleSheet.insertRule(`
			${footSel.join(', ')}, ${headSel.join(', ')} {
				z-index: 3;
			}
		`)
	}

	protected fixLastColumns(cols: NodeListOf<HTMLTableFixElement>, count: number)
	{
		const all1Sel: string[] = []
		const all2Sel: string[] = []
		const bodySel: string[] = []
		const footSel: string[] = []
		const headSel: string[] = []
		let counter = 1, position = .0, width = .0
		Array.from(cols).reverse().toSpliced(count).forEach(col => {
			position += width
			width = col.getBoundingClientRect().width
			const right = position ? `calc(${position}px + var(--border-width))` : `${position}px`
			this.styleSheet.insertRule(`
				${this.selector} > * > tr > :nth-last-child(${counter}) {
					right: ${right};
				}
			`)
			all1Sel.push(`${this.selector} > * > tr > :nth-last-child(${counter})`)
			all2Sel.push(`${this.selector} > * > tr > :nth-last-child(${counter+1})`)
			bodySel.push(`${this.selector} > tbody > tr > :nth-last-child(${counter})`)
			footSel.push(`${this.selector} > tfoot > tr > :nth-last-child(${counter})`)
			headSel.push(`${this.selector} > thead > tr > :nth-last-child(${counter})`)
			counter ++
		})
		this.styleSheet.insertRule(`
			${all1Sel.join(', ')} {
				border-left: var(--border-width) var(--border-style) var(--border-color);
			}
		`)
		this.styleSheet.insertRule(`
			${all2Sel.join(', ')} {
				border-right: none;
			}
		`)
		this.styleSheet.insertRule(`
			${bodySel.join(', ')} {
				position: sticky;
				z-index: 2;
			}
		`)
		this.styleSheet.insertRule(`
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
			const [increment, style] = (section === 'tfoot') ? [-1, 'bottom'] : [1, 'top']
			let counter = 2, height = .0, position = .0
			rows.forEach(row =>
			{
				position += height
				height = row.getBoundingClientRect().height
				if (!position) {
					return
				}
				this.styleSheet.insertRule(`
					${this.selector} > ${section} > tr:nth-child(${counter}) > * {
						${style}: ${position}px;
					}
				`)
				counter += increment
			})
		})
	}

}
