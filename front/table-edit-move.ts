import { HTMLEditableElement } from '../node_modules/@itrocks/contenteditable/contenteditable.js'
import Plugin                  from '../node_modules/@itrocks/plugin/plugin.js'
import Table                   from './table.js'
import TableEdit               from './table-edit.js'

export class TableEditMove extends Plugin<Table>
{
	tableEdit: TableEdit

	constructor(table: Table)
	{
		super(table)
		this.tableEdit = table.plugins.TableEdit as TableEdit

		const superCreateEditable = this.tableEdit.createEditable
		this.tableEdit.createEditable = (selected, selectedStyle) => this.setEditableKeydownListener(
			superCreateEditable.call(this.tableEdit, selected, selectedStyle)
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

	setEditableKeydownListener(editable: HTMLEditableElement)
	{
		editable.addEventListener('keydown', event => {
			const tableEdit = this.tableEdit
			if (event.altKey || event.ctrlKey || event.shiftKey) return
			switch (event.key) {
				case 'ArrowDown': {
					const br        = editable.editable.br()
					const textAfter = tableEdit.textContentAfterRange(tableEdit.getSelectionRange())
					if ((textAfter === br) || (textAfter.indexOf(br) < 0) || (textAfter.indexOf(br) + 4 === textAfter.length)) {
						this.selectNextRow()
						event.preventDefault()
					}
					return
				}
				case 'ArrowLeft': {
					if (tableEdit.textContentBeforeRange(tableEdit.getSelectionRange()).length) return
					this.selectPreviousColumn()
					event.preventDefault()
					return
				}
				case 'ArrowRight': {
					const br        = editable.editable.br()
					const textAfter = tableEdit.textContentAfterRange(tableEdit.getSelectionRange())
					if (['', br].includes(textAfter)) {
						this.selectNextColumn()
						event.preventDefault()
					}
					return
				}
				case 'ArrowUp': {
					if (tableEdit.textContentBeforeRange(tableEdit.getSelectionRange()).includes(editable.editable.br())) return
					this.selectPreviousRow()
					event.preventDefault()
					return
				}
				case 'Enter': {
					const br        = editable.editable.br()
					const textAfter = tableEdit.textContentAfterRange(tableEdit.getSelectionRange())
					if (['', br].includes(textAfter)) {
						this.selectNextRow()
						event.preventDefault()
						event.stopImmediatePropagation()
					}
					return
				}
				case 'Escape': {
					tableEdit.setSelectionRange(tableEdit.editableFullRange(tableEdit.getSelectionRange()))
					return
				}
				case 'F2': {
					const range     = tableEdit.getSelectionRange()
					const selection = document.createElement('div')
					selection.appendChild(range.cloneContents())
					if (selection.innerHTML === tableEdit.editable()?.editable.value()) {
						tableEdit.setSelectionRange(tableEdit.editableEndRange(range))
					}
					return
				}
			}
		}, { capture: true })
		return editable
	}

}
export default TableEditMove
