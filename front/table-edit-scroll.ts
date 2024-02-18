import { Plugin, Table } from './table.js'
import TableEdit         from './table-edit'

export class TableEditScroll extends Plugin
{

	constructor(table: Table)
	{
		super(table)

		const tableEdit = table.plugins.TableEdit as TableEdit
		const original  = tableEdit.setSelectedCell
		tableEdit.setSelectedCell = cell => original.call(tableEdit, this.scrollToCell(cell))
	}

	closestScrollable(element: Element)
	{
		let parent = element.closest('table')?.parentElement
		while (parent && (parent.scrollHeight <= parent.clientHeight)) {
			parent = parent.parentElement
		}
		return parent ? ((parent instanceof HTMLHtmlElement) ? window : parent) : null
	}

	scrollToCell(cell: HTMLTableCellElement)
	{
		const into = this.table.visibleInnerRect()
		const rect = cell.getBoundingClientRect()
		if (
			(rect.bottom   <= into.bottom)
			&& (rect.left  >= into.left)
			&& (rect.right <= into.right)
			&& (rect.top   >= into.top)
		) {
			return cell
		}

		const scrollable = this.closestScrollable(cell)
		if (!scrollable) return cell

		let shiftLeft = 0
		let shiftTop  = 0
		if (rect.top < into.top) {
			shiftTop = rect.top - into.top
		}
		else if (rect.bottom > into.bottom) {
			shiftTop = rect.bottom - into.bottom
		}
		if (rect.left < into.left) {
			shiftLeft = rect.left - into.left
		}
		else if (rect.right > into.right) {
			shiftLeft = rect.right - into.right
		}
		if (!shiftLeft && !shiftTop) return cell

		if (getComputedStyle(cell).position === 'sticky') {
			if ((getComputedStyle(cell).left !== 'auto') || (getComputedStyle(cell).right !== 'auto')) {
				shiftLeft = 0
			}
			if ((getComputedStyle(cell).top !== 'auto') || (getComputedStyle(cell).bottom !== 'auto')) {
				shiftTop = 0
			}
		}
		if (!shiftLeft && !shiftTop) return cell

		scrollable.scrollBy(shiftLeft, shiftTop)
		return cell
	}

}
export default TableEditScroll
