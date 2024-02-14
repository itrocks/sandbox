import TableEdit from './table-edit.js'

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

function nextSiblingTextContent(range: Range)
{
	const container = range.endContainer
	if ((container instanceof Element) && container.hasAttribute('contenteditable')) {
		return ''
	}
	let   node      = container.nextSibling
	let   text      = container.textContent ? container.textContent.substring(range.endOffset) : ''
	while (node) {
		if (node.textContent) {
			text += node.textContent
		}
		node = node.nextSibling
			? node.nextSibling
			: (node.parentElement?.hasAttribute('contenteditable') ? node.parentElement.nextSibling : null)
	}
	return text
}

function previousSiblingTextContent(range: Range)
{
	const container = range.startContainer
	let   node      = container.previousSibling
	let   text      = container.textContent ? container.textContent.substring(0, range.startOffset) : ''
	while (node) {
		if (node.textContent) {
			text = node.textContent + text
		}
		node = node.previousSibling
			? node.previousSibling
			: (node.parentElement?.hasAttribute('contenteditable') ? node.parentElement.previousSibling : null)
	}
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
			const selection = getSelection()
			if (selection?.rangeCount !== 1) {
				throw 'Should have range'
			}
			// startOffset, endOffset, startContainer, endContainer, commonAncestorContainer
			switch (event.key) {
				case 'ArrowDown':
					if (nextSiblingTextContent(selection.getRangeAt(0)).includes("\n")) return
					this.selectNextRow()
					event.preventDefault()
					return
				case 'ArrowLeft':
					if (previousSiblingTextContent(selection.getRangeAt(0)).length) return
					this.selectPreviousColumn()
					event.preventDefault()
					return
				case 'ArrowRight':
					if (nextSiblingTextContent(selection.getRangeAt(0)).length) return
					this.selectNextColumn()
					event.preventDefault()
					return
				case 'ArrowUp':
					if (previousSiblingTextContent(selection.getRangeAt(0)).includes("\n")) return
					this.selectPreviousRow()
					event.preventDefault()
					return
				case 'Enter':
					if (nextSiblingTextContent(selection.getRangeAt(0)).length) return
					this.selectNextRow()
					event.preventDefault()
					return
			}
		})
		return editable
	}

}
export default TableEditMove
