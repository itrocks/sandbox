import { HTMLTableFixElement, Plugin, Table } from './table.js'

export class ColumnReorderTable extends Plugin
{
	reorderCells: NodeListOf<HTMLTableFixElement>

	constructor(table: Table)
	{
		super(table)

		this.reorderCells = this.getReorderCells()

		let downed:   HTMLTableCellElement|undefined
		let dragging: HTMLTableCellElement|undefined
		let mouse     = new DOMRect()
		let mouseFrom = new DOMRect()
		Array.from(this.reorderCells).forEach(cell => {
			table.addEventListener(cell, 'mousedown', event => {
				console.log('mousedown', event.target)
				downed    = event.target as HTMLTableCellElement
				mouseFrom = new DOMRect(mouse.x, mouse.y)
			})
		})
		table.addEventListener(document, 'mousemove', event => {
			Object.assign(mouse, { x: event.pageX, y: event.pageY })
			if (downed && (Math.sqrt(Math.abs(mouse.x - mouseFrom.x) * Math.abs(mouse.y - mouseFrom.y)) > 10)) {
				dragging = downed
				console.log('drag', dragging)
				Object.assign(mouseFrom, mouse)
				downed = undefined
			}
			if (dragging) {
				console.log('dragging', dragging)
			}
		})
		table.addEventListener(document, 'mouseup', () => {
			if (dragging) {
				console.log('drop', dragging)
			}
			downed   = undefined
			dragging = undefined
		})
	}

	protected getReorderCells()
	{
		if (this.reorderCells) return this.reorderCells
		let cells: NodeListOf<HTMLTableFixElement>
		cells = this.table.element.querySelectorAll<HTMLTableColElement>(':scope > thead > tr:first-child > *')
		if (!cells.length) {
			cells = this.table.element.querySelectorAll<HTMLTableColElement>(':scope > tbody > tr:first-child > *')
		}
		return cells
	}

}
export default ColumnReorderTable
