import { Plugin, Table } from './table.js'
import TableEdit         from './table-edit'

export class TableEditScroll extends Plugin
{

	constructor(table: Table)
	{
		super(table)

		const tableEdit = table.plugins.TableEdit as TableEdit
		const original  = tableEdit.setSelectedCell
		tableEdit.setSelectedCell = (cell: HTMLTableCellElement) => {
			this.scrollToCell(cell)
			original.call(tableEdit, cell)
		}
	}

	closestScrollable(element: Element)
	{
		let parent = element.closest('table')?.parentElement
		while (parent && parent.scrollHeight < parent.clientHeight) {
			parent = parent.parentElement
		}
		return parent ? ((parent.scrollHeight < parent.clientHeight) ? window : parent) : null
	}

	scrollToCell(cell: HTMLTableCellElement)
	{
		const into = this.table.visibleInnerRect()
		const rect = cell.getBoundingClientRect()
		if (
			(rect.left >= into.left)
			&& (rect.top >= into.top)
			&& (rect.right <= into.right)
			&& (rect.bottom <= into.bottom)
		) {
			return
		}

		const scrollable = this.closestScrollable(cell)
		if (!scrollable) return

		let shiftLeft = 0
		let shiftTop  = 0
		if (rect.bottom > into.bottom) {
			shiftTop = rect.bottom - into.bottom
		}
		if (rect.right > into.right) {
			shiftLeft = rect.right - into.right
		}
		if (rect.left < into.left) {
			shiftLeft = rect.left - into.left
		}
		if (rect.top < into.top) {
			shiftTop = rect.top - into.top
		}
		if (!shiftLeft && !shiftTop) return

		if (getComputedStyle(cell).position === 'sticky') {
			if ((getComputedStyle(cell).left !== 'auto') || (getComputedStyle(cell).right !== 'auto')) {
				shiftLeft = 0
			}
			if ((getComputedStyle(cell).top !== 'auto') || (getComputedStyle(cell).bottom !== 'auto')) {
				shiftTop = 0
			}
		}
		if (!shiftLeft && !shiftTop) return

		scrollable.scrollBy(shiftLeft, shiftTop)
	}

}
export default TableEditScroll
