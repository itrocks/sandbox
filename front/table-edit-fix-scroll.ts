import FixTable  from './fix-table.js'
import Plugin    from './plugin.js'
import Table     from './table.js'
import TableEdit from './table-edit.js'

export class TableEditFixScroll extends Plugin<Table>
{
	fixTable: FixTable

	constructor(table: Table)
	{
		super(table)
		this.fixTable = table.plugins.FixTable as FixTable

		const tableEdit = table.plugins.TableEdit as TableEdit
		const original  = tableEdit.setSelectedCell
		tableEdit.setSelectedCell = cell => original.call(tableEdit, this.scrollToCell(cell))
	}

	scrollToCell(cell: HTMLTableCellElement)
	{
		const into = this.fixTable.visibleInnerRect()
		const rect = cell.getBoundingClientRect()

		const cellStyle  = getComputedStyle(cell)
		const rectBottom = rect.bottom + 1 - parseFloat(cellStyle.borderBottomWidth)
		const rectRight  = rect.right  + 2 - parseFloat(cellStyle.borderRightWidth) * 2 // fine-tuning

		if (
			(rect.top      >= into.top)
			&& (rectBottom <= into.bottom)
			&& (rect.left  >= into.left)
			&& (rectRight  <= into.right)
		) {
			return cell
		}

		const scrollable = this.fixTable.closestScrollable(cell)
		if (!scrollable) return cell

		let shiftX = 0
		let shiftY = 0
		if (rect.top < into.top) {
			shiftY = rect.top - into.top
		}
		else if (rectBottom > into.bottom) {
			shiftY = rectBottom - into.bottom
		}
		if (rect.left < into.left) {
			shiftX = Math.floor(rect.left - into.left) // fine-tuning
		}
		else if (rectRight > into.right) {
			shiftX = rectRight - into.right
		}
		if (!shiftX && !shiftY) return cell

		if (cellStyle.position === 'sticky') {
			if ((cellStyle.left !== 'auto') || (cellStyle.right !== 'auto')) {
				shiftX = 0
			}
			if ((cellStyle.top !== 'auto') || (cellStyle.bottom !== 'auto')) {
				shiftY = 0
			}
		}
		if (!shiftX && !shiftY) return cell

		scrollable.scrollBy(shiftX, shiftY)

		return cell
	}

}
export default TableEditFixScroll
