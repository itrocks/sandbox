import {HTMLTableFixElement, Plugin, Table} from './table.js'

export class FixTable extends Plugin
{
	columns:          NodeListOf<HTMLTableFixElement>
	leftColumnCount:  number
	rightColumnCount: number

	constructor(table: Table)
	{
		super(table)
		this.columns          = this.getColumns()
		this.leftColumnCount  = this.countLeftColumns()
		this.rightColumnCount = this.countRightColumns()

		const original         = table.visibleInnerRect
		table.visibleInnerRect = () => this.visibleInnerRect(original.call(table))
	}

	init()
	{
		this.fixFootRows()
		this.fixHeadRows()
		this.fixLeftColumns()
		this.fixRightColumns()
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

	protected fixFootRows()
	{
		const table = this.table
		if (!table.element.tFoot?.rows.length) return
		let counter = 1, bottom = .0, previousBottom = table.element.getBoundingClientRect().bottom
		Array.from(table.element.tFoot.querySelectorAll<HTMLTableRowElement>(':scope > tr')).reverse().forEach(row => {
			const actualBottom = row.getBoundingClientRect().bottom
			bottom += previousBottom - actualBottom
			previousBottom = actualBottom
			table.styleSheet.push(`
				${table.selector} > tfoot > tr:nth-last-child(${counter}) > * {
					bottom: ${this.position(bottom, counter, row.firstElementChild as HTMLTableCellElement, 'bottom')};
				}
			`)
			counter ++
		})
		table.styleSheet.push(`
			${table.selector} > tfoot > tr > * {
				position: sticky;
			}		
		`)
	}

	protected fixHeadRows()
	{
		const table = this.table
		if (!table.element.tHead?.rows.length) return
		let counter = 1, top = .0, previousTop = table.element.getBoundingClientRect().top
		table.element.tHead.querySelectorAll<HTMLTableRowElement>(':scope > tr').forEach(row => {
			const actualTop = row.getBoundingClientRect().top
			top += actualTop - previousTop
			previousTop = actualTop
			table.styleSheet.push(`
				${table.selector} > thead > tr:nth-child(${counter}) > * {
					top: ${this.position(top, counter, row.firstElementChild as HTMLTableCellElement, 'top')};
				}
			`)
			counter ++
		})
		table.styleSheet.push(`
			${table.selector} > thead > tr > * {
				position: sticky;
			}		
		`)
	}

	protected fixLeftColumns()
	{
		if (!this.leftColumnCount) return
		const table = this.table
		const bodySel: string[] = []
		const headSel: string[] = []
		let counter = 1, left = .0, previousLeft = table.element.getBoundingClientRect().left
		Array.from(this.columns).toSpliced(this.leftColumnCount).forEach(col => {
			const actualLeft = col.getBoundingClientRect().left
			left += actualLeft - previousLeft
			previousLeft = actualLeft
			table.styleSheet.push(`
				${table.selector} > * > tr > :nth-child(${counter}) {
					left: ${this.position(left, counter, col, 'left')};
				}
			`)
			bodySel.push(`${table.selector} > tbody > tr > :nth-child(${counter})`)
			headSel.push(`${table.selector} > tfoot > tr > :nth-child(${counter})`)
			headSel.push(`${table.selector} > thead > tr > :nth-child(${counter})`)
			counter ++
		})
		table.styleSheet.push(`
			${bodySel.join(', ')} {
				position: sticky;
			}
			${headSel.join(', ')} {
				z-index: 1;
			}
		`)
	}

	protected fixRightColumns()
	{
		if (!this.rightColumnCount) return
		const table = this.table
		const bodySel: string[] = []
		const headSel: string[] = []
		let counter = 1, right = .0, previousRight = table.element.getBoundingClientRect().right
		Array.from(this.columns).reverse().toSpliced(this.rightColumnCount).forEach(col => {
			const actualRight = col.getBoundingClientRect().right
			right += previousRight - actualRight
			previousRight = actualRight
			table.styleSheet.push(`
				${table.selector} > * > tr > :nth-last-child(${counter}) {
					right: ${this.position(right, counter, col, 'right')};
				}
			`)
			bodySel.push(`${table.selector} > tbody > tr > :nth-last-child(${counter})`)
			headSel.push(`${table.selector} > thead > tr > :nth-last-child(${counter})`)
			counter ++
		})
		table.styleSheet.push(`
			${bodySel.join(', ')} {
				position: sticky;
			}
			${headSel.join(', ')} {
				z-index: 1;
			}
		`)
	}

	protected getColumns()
	{
		if (this.columns) return this.columns
		const table = this.table
		let columns = table.element.querySelectorAll<HTMLTableColElement>(':scope > colgroup > col')
		if (!columns.length) {
			columns = table.element.querySelectorAll<HTMLTableColElement>(':scope > thead > tr:first-child > *')
			if (!columns.length) {
				columns = table.element.querySelectorAll<HTMLTableColElement>(':scope > tbody > tr:first-child > *')
			}
		}
		return columns
	}

	position(
		position: number,
		_counter: number,
		_row: HTMLTableFixElement,
		_side: 'bottom'|'left'|'right'|'top'
	) {
		return `${position}px`
	}

	visibleInnerRect(tableRect: DOMRect)
	{
		const rect         = new DOMRect()
		const tableElement = this.table.element
		rect.x = this.leftColumnCount
			? this.columns[this.leftColumnCount - 1].getBoundingClientRect().right
			: tableRect.left
		rect.y = tableElement.tHead?.lastElementChild?.firstElementChild
			? tableElement.tHead.lastElementChild.firstElementChild.getBoundingClientRect().bottom
			: tableRect.bottom
		rect.width = 1 - rect.x + (
			this.rightColumnCount
				? this.columns[this.columns.length - this.rightColumnCount].getBoundingClientRect().left
				: tableRect.right
		)
		rect.height = 1 - rect.y + (
			tableElement.tFoot?.firstElementChild?.firstElementChild
				? tableElement.tFoot.firstElementChild.firstElementChild.getBoundingClientRect().top
				: tableRect.top
		)
		return rect
	}

}
export default FixTable
