import FixTable          from './fix-table.js'
import { Plugin, Table } from './table.js'
import TableEdit         from './table-edit.js'

const zIndex = {
	back:     false,
	editable: '',
	selected: ''
}

export class TableEditFixHide extends Plugin
{
	readonly fixTable:  FixTable
	readonly tableEdit: TableEdit

	constructor(table: Table)
	{
		super(table)

		const fixTable  = this.fixTable  = table.plugins.FixTable  as FixTable
		const tableEdit = this.tableEdit = table.plugins.TableEdit as TableEdit

		const scrollable = this.fixTable.closestScrollable(table.element)
		if (!scrollable) return

		fixTable.full    = { column: '2', corner: '6', row: '4' }
		tableEdit.zIndex = '7'

		table.addEventListener(scrollable, 'scroll', () => this.autoHide(tableEdit.editable(), tableEdit.selected()))
		table.addEventListener(window,     'resize', () => this.autoHide(tableEdit.editable(), tableEdit.selected()))

		const original = tableEdit.createEditable
		tableEdit.createEditable = (selected, selectedStyle) => this.addEditableEventListeners(
			original.call(tableEdit, selected, selectedStyle), selected
		)
	}

	addEditableEventListeners(editable: HTMLDivElement, selected: HTMLTableCellElement)
	{
		zIndex.back = false
		this.autoHide(editable, selected)
		const goAhead = () => this.goAhead(editable, selected)
		editable.addEventListener('keydown', goAhead)
		editable.addEventListener('keyup',   goAhead)
		editable.addEventListener('click',   goAhead)
		return editable
	}

	autoHide(editable?: HTMLDivElement, selected?: HTMLTableCellElement)
	{
		if (!editable || !selected) return

		const into = this.fixTable.visibleInnerRect()
		const rect = selected.getBoundingClientRect()

		let fixColumn = false
		let fixRow    = false

		const style  = getComputedStyle(selected)
		const sticky = (style.position === 'sticky') ? '1' : ''
		if (sticky) {
			fixColumn = (style.left !== 'auto') || (style.right !== 'auto')
			fixRow    = (style.top !== 'auto') || (style.bottom !== 'auto')
		}

		const backHorizontal = !fixColumn && ((rect.left < into.left) || (rect.right > into.right))
		const backVertical   = !fixRow    && ((rect.top < into.top) || (rect.bottom > into.bottom))

		if (backHorizontal || backVertical) {
			this.goBack(editable, selected)
		}
		else {
			this.goAhead(editable, selected)
		}
	}

	goAhead(editable?: HTMLDivElement, selected?: HTMLTableCellElement)
	{
		if (!zIndex.back || !editable || !selected) return

		zIndex.editable.length ? (editable.style.zIndex = zIndex.editable) : editable.style.removeProperty('z-index')
		zIndex.selected.length ? (selected.style.zIndex = zIndex.selected) : selected.style.removeProperty('z-index')

		zIndex.back     = false
		zIndex.editable = ''
		zIndex.selected = ''
	}

	goBack(editable?: HTMLDivElement, selected?: HTMLTableCellElement)
	{
		if (zIndex.back || !editable || !selected) return

		zIndex.back     = true
		zIndex.editable = editable.style.zIndex
		zIndex.selected = selected.style.zIndex

		selected.style.removeProperty('z-index')
		const style    = getComputedStyle(selected)
		const newIndex = (parseInt((style.zIndex === 'auto') ? '0' : style.zIndex) + 1).toString()
		selected.style.zIndex = newIndex
		editable.style.zIndex = newIndex
	}

}
export default TableEditFixHide
