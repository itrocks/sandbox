import Plugin    from './plugin.js'
import Table     from './table.js'
import TableEdit from './table-edit.js'

export class TableEditMove extends Plugin<Table>
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
		let   siblingRow = row[elementSibling] ?? undefined
		if (!siblingRow) {
			const section        = row.closest('tbody, tfoot, thead') as HTMLTableSectionElement
			const siblingSection = section[elementSibling] as HTMLTableSectionElement ?? undefined
			siblingRow           = siblingSection[elementChild] ?? undefined
		}
		if (siblingRow) {
			const selector = ':scope > :nth-child(' + (this.of.cellColumnNumber(selected) + 1).toString() + ')'
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
					if (tableEdit.textContentAfterRange(tableEdit.getSelectionRange()).includes("\n")) return
					this.selectNextRow()
					event.preventDefault()
					return
				case 'ArrowLeft':
					if (tableEdit.textContentBeforeRange(tableEdit.getSelectionRange()).length) return
					this.selectPreviousColumn()
					event.preventDefault()
					return
				case 'ArrowRight':
					if (tableEdit.textContentAfterRange(tableEdit.getSelectionRange()).length) return
					this.selectNextColumn()
					event.preventDefault()
					return
				case 'ArrowUp':
					if (tableEdit.textContentBeforeRange(tableEdit.getSelectionRange()).includes("\n")) return
					this.selectPreviousRow()
					event.preventDefault()
					return
				case 'Enter':
					if (tableEdit.textContentAfterRange(tableEdit.getSelectionRange()).length) return
					this.selectNextRow()
					event.preventDefault()
					return
				case 'Escape':
					tableEdit.setSelectionRange(tableEdit.editableFullRange(tableEdit.getSelectionRange()))
					return
				case 'F2': {
					const range = tableEdit.getSelectionRange()
					if (tableEdit.rangeTextContent(range) === tableEdit.rangeTextContent(tableEdit.editableFullRange(range))) {
						tableEdit.setSelectionRange(tableEdit.editableEndRange(range))
					}
					return
				}
			}
		})
		return editable
	}

}
export default TableEditMove
