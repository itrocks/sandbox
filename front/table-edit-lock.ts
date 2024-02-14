import TableEdit        from './table-edit.js'
import { TableOptions } from './table.js'

function cellPosition(cell: HTMLTableCellElement)
{
	let count = 1
	let previous = cell.previousElementSibling
	while (previous) {
		if ((previous.tagName === 'TD') || (previous.tagName === 'TH')) {
			count ++
		}
		previous = previous.previousElementSibling
	}
	return count
}

function colCell(cell: HTMLTableCellElement)
{
	const table = cell.closest('table') as HTMLTableElement
	const position = cellPosition(cell)
	const col = table.querySelectorAll(':scope > colgroup')[0]
	if (col) {
		return col.children[position - 1] as HTMLTableColElement
	}
	const sections: NodeListOf<HTMLTableSectionElement>
		= table.querySelectorAll(':scope > tbody, :scope > tfoot, :scope > thead')
	const cellTr = cell.closest('TR')
	let foreignRow: HTMLTableRowElement|undefined
	sections.forEach(section => {
		if (foreignRow) return
		let tr = section.firstElementChild as HTMLTableRowElement|null
		if (!tr) return
		if (cellTr === tr) {
			tr = tr.nextElementSibling as HTMLTableRowElement|null
		}
		if (!tr) return
		foreignRow = tr
	})
	return foreignRow?.children[position - 1] as HTMLTableCellElement ?? cell
}

export class TableEditLock extends TableEdit
{

	options = new Options

	static defaultOptions()
	{
		return new Options
	}

	editable(target: any)
	{
		let editable = super.editable(target)
		Object.entries(this.options.nonEditableConditions).forEach(([index, value]) => {
			if (!editable) return
			switch (index) {
				case 'closest':
					editable = editable.closest(value) ? undefined : editable
					break
				case 'col':
					editable = colCell(editable).matches(value) ? undefined : editable
					break
				default:
					editable = (getComputedStyle(editable)[index as keyof CSSStyleDeclaration] === value) ? undefined : editable
			}
		})
		return editable
	}

}
export default TableEditLock

export interface TableEditLockOptions
{
	nonEditableConditions: { [index: string]: string }
}

class Options extends TableOptions implements TableEditLockOptions
{
	nonEditableConditions = {
		'closest': '[data-lock]',
		'col':     '[data-lock]'
	}
}
