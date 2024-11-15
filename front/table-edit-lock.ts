import Plugin    from '../node_modules/@itrocks/plugin/plugin.js'
import Table     from './table.js'
import TableEdit from './table-edit.js'

class Options
{
	nonEditableConditions: { [index: string]: string } = {
		'closest': 'tfoot, thead, [data-lock]',
		'col':     '[data-lock]'
	}
}

export class TableEditLock extends Plugin<Table>
{
	options = new Options

	constructor(table: Table, options: Partial<Options> = {})
	{
		super(table)
		Object.assign(this.options, options)

		const tableEdit = table.plugins.TableEdit as TableEdit
		const superClosestEditableCell = tableEdit.closestEditableCell
		tableEdit.closestEditableCell = target => this.closestEditableCell(superClosestEditableCell.call(tableEdit, target))
	}

	colCell(cell: HTMLTableCellElement)
	{
		const table    = cell.closest('table') as HTMLTableElement
		const position = this.of.cellColumnNumber(cell)
		const col      = table.querySelector(':scope > colgroup')
		if (col) {
			return col.children[position] as HTMLTableColElement
		}
		const sections: NodeListOf<HTMLTableSectionElement> = table.querySelectorAll(
			':scope > tbody, :scope > tfoot, :scope > thead'
		)
		const cellTr = cell.closest('tr')
		let foreignRow: HTMLTableRowElement | undefined
		sections.forEach(section => {
			if (foreignRow) return
			let tr = section.firstElementChild as HTMLTableRowElement ?? undefined
			if (!tr) return
			if (cellTr === tr) {
				tr = tr.nextElementSibling as HTMLTableRowElement ?? undefined
			}
			if (!tr) return
			foreignRow = tr
		})
		return foreignRow?.children[position] as HTMLTableCellElement ?? cell
	}

	closestEditableCell(editable?: HTMLTableCellElement)
	{
		let style: CSSStyleDeclaration | undefined
		for (const [index, value] of Object.entries(this.options.nonEditableConditions)) {
			if (!editable) return
			switch (index) {
				case 'closest':
					if (editable.closest(value)) editable = undefined
					break
				case 'col':
					if (this.colCell(editable).matches(value)) editable = undefined
					break
				default:
					if (!style) style = getComputedStyle(editable)
					if (style[index as keyof CSSStyleDeclaration] === value) editable = undefined
			}
		}
		return editable
	}

	static defaultOptions()
	{
		return new Options
	}

}
export default TableEditLock
