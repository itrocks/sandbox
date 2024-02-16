import {
	closestEditable,
	editableEndRange,
	editableFullRange,
	getSelectionRange,
	setSelectionRange,
	TableEdit
} from './table-edit.js'

function cellPosition(cell: HTMLTableCellElement)
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

function nextSiblingTextContent(range: Range)
{
	const editable = closestEditable(range.commonAncestorContainer)
	const next     = new Range()
	next.setStart(range.endContainer, range.endOffset)
	editable.lastChild
		? next.setEndAfter(editable.lastChild)
		: next.setEnd(editable, editable.textContent?.length ?? 0)
	return rangeTextContent(next)
}

function previousSiblingTextContent(range: Range)
{
	const editable = closestEditable(range.commonAncestorContainer)
	const previous = new Range()
	previous.setStart(editable, 0)
	previous.setEnd(range.startContainer, range.startOffset)
	return rangeTextContent(previous)
}

function rangeTextContent(range: Range)
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
	if (text.endsWith('<br>') && !nextSiblingTextContent(range).length) {
		text = text.substring(0, text.length - 4)
	}
	text = text.replaceAll('<br>', "\n").replaceAll('</div><div>', "\n")
	return text
}

export class TableEditMove extends TableEdit
{

	selectNextColumn()
	{
		const selected = this.selected()
		if (!selected) return
		const cell = selected.nextElementSibling as HTMLTableCellElement
		if (this.closestEditableCell(cell)) {
			this.selectCell(cell)
		}
	}

	selectNextRow()
	{
		const selected = this.selected()
		if (!selected) return
		const row     = selected.closest('tr') as HTMLTableRowElement
		let   nextRow = row.nextElementSibling
		if (!nextRow) {
			const section     = row.closest('tbody, tfoot, thead') as HTMLTableSectionElement
			const nextSection = section.nextElementSibling as HTMLTableSectionElement
			nextRow           = nextSection.firstElementChild as HTMLTableRowElement
		}
		if (nextRow) {
			const selector = ':scope > :nth-child(' + cellPosition(selected) + ')'
			const cell     = nextRow.querySelectorAll(selector)[0] as HTMLTableCellElement
			if (this.closestEditableCell(cell)) {
				this.selectCell(cell)
			}
		}
	}

	selectPreviousColumn()
	{
		const selected = this.selected()
		if (!selected) return
		const cell = selected.previousElementSibling as HTMLTableCellElement
		if (this.closestEditableCell(cell)) {
			this.selectCell(cell)
		}
	}

	selectPreviousRow()
	{
		const selected = this.selected()
		if (!selected) return
		const row         = selected.closest('tr') as HTMLTableRowElement
		let   previousRow = row.previousElementSibling
		if (!previousRow) {
			const section         = row.closest('tbody, tfoot, thead') as HTMLTableSectionElement
			const previousSection = section.previousElementSibling as HTMLTableSectionElement
			previousRow           = previousSection.lastElementChild as HTMLTableRowElement
		}
		if (previousRow) {
			const selector = ':scope > :nth-child(' + cellPosition(selected) + ')'
			const cell     = previousRow.querySelectorAll(selector)[0] as HTMLTableCellElement
			if (this.closestEditableCell(cell)) {
				this.selectCell(cell)
			}
		}
	}

	createEditable(computedStyle: CSSStyleDeclaration)
	{
		const editable = super.createEditable(computedStyle)
		if (!editable) return null

		editable.addEventListener('keydown', event => {
			if (event.altKey || event.ctrlKey || event.shiftKey) return
			switch (event.key) {
				case 'ArrowDown':
					if (nextSiblingTextContent(getSelectionRange()).includes("\n")) return
					this.selectNextRow()
					event.preventDefault()
					return
				case 'ArrowLeft':
					if (previousSiblingTextContent(getSelectionRange()).length) return
					this.selectPreviousColumn()
					event.preventDefault()
					return
				case 'ArrowRight':
					if (nextSiblingTextContent(getSelectionRange()).length) return
					this.selectNextColumn()
					event.preventDefault()
					return
				case 'ArrowUp':
					if (previousSiblingTextContent(getSelectionRange()).includes("\n")) return
					this.selectPreviousRow()
					event.preventDefault()
					return
				case 'Enter':
					if (nextSiblingTextContent(getSelectionRange()).length) return
					this.selectNextRow()
					event.preventDefault()
					return
				case 'Escape':
					setSelectionRange(editableFullRange(getSelectionRange()))
					return
				case 'F2':
					const range = getSelectionRange()
					if (rangeTextContent(range) === rangeTextContent(editableFullRange(range))) {
						setSelectionRange(editableEndRange(range))
					}
					return
			}
		})
		return editable
	}

}
export default TableEditMove
