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

	addEditableEventListeners(editable: HTMLDivElement, selected: HTMLTableCellElement)
	{
		const goAhead = () => this.goAhead(editable, selected)
		editable.addEventListener('keydown', goAhead)
		editable.addEventListener('keyup',   goAhead)
		editable.addEventListener('click',   goAhead)
		goAhead()
		return editable
	}

	autoHide()
	{
		const editable = this.tableEdit.editable()
		const selected = this.tableEdit.selected()
		if (!editable || !selected) return

		const into = this.table.visibleInnerRect()
		const rect = selected.getBoundingClientRect()

		if (
			(Math.round(rect.left - into.left) < 0)
			|| (Math.round(rect.top - into.top) < 0)
			|| (Math.round(rect.right - into.right) > 0)
			|| (Math.round(rect.bottom - into.bottom) > 0)
		) {
			this.goBack(editable, selected)
		}
		else {
			this.goAhead(editable, selected)
		}
	}

	closestScrollable(element: Element)
	{
		let parent = element.closest('table')?.parentElement
		while (parent && (parent.scrollHeight <= parent.clientHeight)) {
			parent = parent.parentElement
		}
		return parent ? ((parent instanceof HTMLHtmlElement) ? window : parent) : null
	}

	constructor(table: Table)
	{
		super(table)

		const fixTable  = this.fixTable  = table.plugins.FixTable  as FixTable
		const tableEdit = this.tableEdit = table.plugins.TableEdit as TableEdit

		const scrollable = this.closestScrollable(table.element)
		if (!scrollable) return

		fixTable.full    = { column: '2', corner: '6', row: '4' }
		tableEdit.zIndex = '7'

		table.addEventListener(scrollable, 'scroll', () => this.autoHide())

		const original = tableEdit.createEditable
		tableEdit.createEditable = (selected, selectedStyle) => this.addEditableEventListeners(
			original.call(tableEdit, selected, selectedStyle), selected
		)
	}

	goAhead(editable: HTMLDivElement|null, selected: HTMLTableCellElement|null)
	{
		if (!editable || !selected || !zIndex.back) return

		zIndex.editable.length ? (editable.style.zIndex = zIndex.editable) : editable.style.removeProperty('z-index')
		zIndex.selected.length ? (selected.style.zIndex = zIndex.selected) : selected.style.removeProperty('z-index')

		zIndex.back     = false
		zIndex.editable = ''
		zIndex.selected = ''
	}

	goBack(editable: HTMLDivElement|null, selected: HTMLTableCellElement|null)
	{
		if (!editable || !selected || zIndex.back) return

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
