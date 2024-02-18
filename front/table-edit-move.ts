import { Plugin, Table } from './table.js'
import TableEdit         from './table-edit.js'

export class TableEditMove extends Plugin
{
	tableEdit: TableEdit

	constructor(table: Table)
	{
		super(table)
		this.tableEdit = table.plugins.TableEdit as TableEdit

		const original = this.tableEdit.createEditable
		this.tableEdit.createEditable = (selected, selectedStyle) => this.setEditableKeydownListener(
			original.call(this.tableEdit, selected, selectedStyle)
		)
	}

	cellPosition(cell: HTMLTableCellElement)
	{
		let count    = 1
		let previous = cell.previousElementSibling
		while (previous) {
			if (['TD', 'TH'].includes(previous.tagName)) {
				count ++
			}
			previous = previous.previousElementSibling
		}
		return count
	}

	nextSiblingTextContent(range: Range)
	{
		const editable = this.tableEdit.closestEditable(range.commonAncestorContainer)
		const next     = new Range()
		next.setStart(range.endContainer, range.endOffset)
		editable.lastChild
			? next.setEndAfter(editable.lastChild)
			: next.setEnd(editable, editable.textContent?.length ?? 0)
		return this.rangeTextContent(next)
	}

	previousSiblingTextContent(range: Range)
	{
		const editable = this.tableEdit.closestEditable(range.commonAncestorContainer)
		const previous = new Range()
		previous.setStart(editable, 0)
		previous.setEnd(range.startContainer, range.startOffset)
		return this.rangeTextContent(previous)
	}

	rangeTextContent(range: Range)
	{
		if (
			(range.startContainer === range.endContainer)
			&& (range.startOffset === range.endOffset)
		) {
			return ''
		}
		const element = document.createElement('div')
		element.appendChild(range.cloneContents())
		let text = element.innerHTML
		if (text.startsWith('<div>') && text.endsWith('</div>')) {
			text = text.substring(5, text.length - 6)
		}
		if (text.endsWith('<br>') && !this.nextSiblingTextContent(range).length) {
			text = text.substring(0, text.length - 4)
		}
		return text.replaceAll('<br>', "\n").replaceAll('</div><div>', "\n").replace(/(<[^>]+>)/g, '')
	}

	selectNextColumn()
	{
		const tableEdit = this.tableEdit
		const selected  = tableEdit.selected()
		if (!selected) return
		const cell = selected.nextElementSibling as HTMLTableCellElement
		if (tableEdit.closestEditableCell(cell)) {
			tableEdit.selectCell(cell)
		}
	}

	selectNextRow()
	{
		const tableEdit = this.tableEdit
		const selected  = tableEdit.selected()
		if (!selected) return
		const row     = selected.closest('tr') as HTMLTableRowElement
		let   nextRow = row.nextElementSibling
		if (!nextRow) {
			const section = row.closest('tbody, tfoot, thead') as HTMLTableSectionElement
			nextRow       = section.nextElementSibling?.firstElementChild as HTMLTableRowElement
		}
		if (nextRow) {
			const selector = ':scope > :nth-child(' + this.cellPosition(selected) + ')'
			const cell     = nextRow.querySelector(selector) as HTMLTableCellElement
			if (tableEdit.closestEditableCell(cell)) {
				tableEdit.selectCell(cell)
			}
		}
	}

	selectPreviousColumn()
	{
		const tableEdit = this.tableEdit
		const selected  = tableEdit.selected()
		if (!selected) return
		const cell = selected.previousElementSibling as HTMLTableCellElement
		if (tableEdit.closestEditableCell(cell)) {
			tableEdit.selectCell(cell)
		}
	}

	selectPreviousRow()
	{
		const tableEdit = this.tableEdit
		const selected  = tableEdit.selected()
		if (!selected) return
		const row         = selected.closest('tr') as HTMLTableRowElement
		let   previousRow = row.previousElementSibling
		if (!previousRow) {
			const section = row.closest('tbody, tfoot, thead') as HTMLTableSectionElement
			previousRow   = section.previousElementSibling?.lastElementChild as HTMLTableRowElement
		}
		if (previousRow) {
			const selector = ':scope > :nth-child(' + this.cellPosition(selected) + ')'
			const cell     = previousRow.querySelector(selector) as HTMLTableCellElement
			if (tableEdit.closestEditableCell(cell)) {
				tableEdit.selectCell(cell)
			}
		}
	}

	setEditableKeydownListener(editable: HTMLDivElement)
	{
		editable.addEventListener('keydown', event => {
			const tableEdit = this.tableEdit
			if (event.altKey || event.ctrlKey || event.shiftKey) return
			switch (event.key) {
				case 'ArrowDown':
					if (this.nextSiblingTextContent(tableEdit.getSelectionRange()).includes("\n")) return
					this.selectNextRow()
					event.preventDefault()
					return
				case 'ArrowLeft':
					if (this.previousSiblingTextContent(tableEdit.getSelectionRange()).length) return
					this.selectPreviousColumn()
					event.preventDefault()
					return
				case 'ArrowRight':
					if (this.nextSiblingTextContent(tableEdit.getSelectionRange()).length) return
					this.selectNextColumn()
					event.preventDefault()
					return
				case 'ArrowUp':
					if (this.previousSiblingTextContent(tableEdit.getSelectionRange()).includes("\n")) return
					this.selectPreviousRow()
					event.preventDefault()
					return
				case 'Enter':
					if (this.nextSiblingTextContent(tableEdit.getSelectionRange()).length) return
					this.selectNextRow()
					event.preventDefault()
					return
				case 'Escape':
					tableEdit.setSelectionRange(tableEdit.editableFullRange(tableEdit.getSelectionRange()))
					return
				case 'F2':
					const range = tableEdit.getSelectionRange()
					if (this.rangeTextContent(range) === this.rangeTextContent(tableEdit.editableFullRange(range))) {
						tableEdit.setSelectionRange(tableEdit.editableEndRange(range))
					}
					return
			}
		})
		return editable
	}

}
export default TableEditMove
