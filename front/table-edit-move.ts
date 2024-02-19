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
		if (text.endsWith('<br>') && !this.textContentAfterRange(range).length) {
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
		return this.selectSiblingRow('nextElementSibling', 'firstElementChild')
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

	selectSiblingRow(
		elementSibling: 'nextElementSibling'|'previousElementSibling',
		elementChild: 'firstElementChild'|'lastElementChild'
	) {
		const tableEdit = this.tableEdit
		const selected  = tableEdit.selected()
		if (!selected) return
		const row     = selected.closest('tr') as HTMLTableRowElement
		let   siblingRow = row[elementSibling]
		if (!siblingRow) {
			const section        = row.closest('tbody, tfoot, thead') as HTMLTableSectionElement
			const siblingSection = section[elementSibling] as HTMLTableSectionElement|null
			siblingRow           = siblingSection ? siblingSection[elementChild] : null
		}
		if (siblingRow) {
			const selector = ':scope > :nth-child(' + this.table.cellColumnNumber(selected) + ')'
			const cell     = siblingRow.querySelector(selector) as HTMLTableCellElement
			if (tableEdit.closestEditableCell(cell)) {
				tableEdit.selectCell(cell)
			}
		}
	}

	selectPreviousRow()
	{
		return this.selectSiblingRow('previousElementSibling', 'lastElementChild')
	}

	setEditableKeydownListener(editable: HTMLDivElement)
	{
		editable.addEventListener('keydown', event => {
			const tableEdit = this.tableEdit
			if (event.altKey || event.ctrlKey || event.shiftKey) return
			switch (event.key) {
				case 'ArrowDown':
					if (this.textContentAfterRange(tableEdit.getSelectionRange()).includes("\n")) return
					this.selectNextRow()
					event.preventDefault()
					return
				case 'ArrowLeft':
					if (this.textContentBeforeRange(tableEdit.getSelectionRange()).length) return
					this.selectPreviousColumn()
					event.preventDefault()
					return
				case 'ArrowRight':
					if (this.textContentAfterRange(tableEdit.getSelectionRange()).length) return
					this.selectNextColumn()
					event.preventDefault()
					return
				case 'ArrowUp':
					if (this.textContentBeforeRange(tableEdit.getSelectionRange()).includes("\n")) return
					this.selectPreviousRow()
					event.preventDefault()
					return
				case 'Enter':
					if (this.textContentAfterRange(tableEdit.getSelectionRange()).length) return
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

	textContentAfterRange(range: Range)
	{
		const editable = this.tableEdit.closestEditable(range.commonAncestorContainer)
		const next     = new Range()
		next.setStart(range.endContainer, range.endOffset)
		editable.lastChild
			? next.setEndAfter(editable.lastChild)
			: next.setEnd(editable, editable.textContent?.length ?? 0)
		return this.rangeTextContent(next)
	}

	textContentBeforeRange(range: Range)
	{
		const editable = this.tableEdit.closestEditable(range.commonAncestorContainer)
		const previous = new Range()
		previous.setStart(editable, 0)
		previous.setEnd(range.startContainer, range.startOffset)
		return this.rangeTextContent(previous)
	}

}
export default TableEditMove
