import TableEdit         from './table-edit.js'
import { Plugin, Table } from './table.js'

class Options
{
	nonEditableConditions: { [index: string]: string } = {
		'closest': 'tfoot, thead, [data-lock]',
		'col':     '[data-lock]'
	}
}

export class TableEditLock extends Plugin
{
	options = new Options

	constructor(table: Table, options: Partial<Options> = {})
	{
		super(table)
		Object.assign(this.options, options)

		const tableEdit               = table.plugins.TableEdit as TableEdit
		const original                = tableEdit.closestEditableCell
		tableEdit.closestEditableCell = (target) => this.closestEditableCell(original.call(tableEdit, target))
	}

	cellPosition(cell: HTMLTableCellElement)
	{
		let count    = 1
		let previous = cell.previousElementSibling
		while (previous) {
			if ((previous.tagName === 'TD') || (previous.tagName === 'TH')) {
				count ++
			}
			previous = previous.previousElementSibling
		}
		return count
	}

	colCell(cell: HTMLTableCellElement)
	{
		const table    = cell.closest('table') as HTMLTableElement
		const position = this.cellPosition(cell)
		const col      = table.querySelector(':scope > colgroup')
		if (col) {
			return col.children[position - 1] as HTMLTableColElement
		}
		const sections: NodeListOf<HTMLTableSectionElement>
			= table.querySelectorAll(':scope > tbody, :scope > tfoot, :scope > thead')
		const cellTr = cell.closest('tr')
		let foreignRow: HTMLTableRowElement|undefined
		sections.forEach(section => {
			if (foreignRow) return
			let tr = section.firstElementChild as HTMLTableRowElement|null
			if (!tr) return
			if (cellTr === tr) {
				tr = tr.nextElementSibling as HTMLTableRowElement|null
			}
			if (!tr) return
			foreignRow = tr
		})
		return foreignRow?.children[position - 1] as HTMLTableCellElement ?? cell
	}

	closestEditableCell(editable: HTMLTableCellElement|null)
	{
		let style: CSSStyleDeclaration
		Object.entries(this.options.nonEditableConditions).forEach(([index, value]) => {
			if (!editable) return null
			switch (index) {
				case 'closest':
					if (editable.closest(value)) editable = null
					break
				case 'col':
					if (this.colCell(editable).matches(value)) editable = null
					break
				default:
					if (!style) style = getComputedStyle(editable)
					if (style[index as keyof CSSStyleDeclaration] === value) editable = null
			}
		})
		return editable
	}

	static defaultOptions()
	{
		return new Options
	}

}
export default TableEditLock
