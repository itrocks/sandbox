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

function nextNode(node: Node): Node|null
{
	return node.nextSibling ?? (
		node.parentElement?.hasAttribute('contenteditable') ? null : (node.parentNode?.nextSibling ?? null)
	)
}

function nextSiblingTextContent(range: Range)
{
	const container = range.endContainer
	if ((container instanceof Element) && container.hasAttribute('contenteditable')) {
		return ''
	}
	let node = nextNode(container)
	let text = container.textContent ? container.textContent.substring(range.endOffset) : ''
	while (node) {
		if (node.textContent?.length) {
			text += node.textContent
		}
		if (['BR', 'DIV'].includes(node.nodeName)) {
			text += "\n"
		}
		node = nextNode(node)
	}
	return text
}

function previousNode(node: Node): Node|null
{
	return node.previousSibling ?? (
		node.parentElement?.hasAttribute('contenteditable') ? null : (node.parentNode?.previousSibling ?? null)
	)
}

function previousSiblingTextContent(range: Range)
{
	const container = range.startContainer
	if ((container instanceof Element) && container.hasAttribute('contenteditable')) {
		return ''
	}
	let node = previousNode(container)
	let text = container.textContent ? container.textContent.substring(0, range.startOffset) : ''
	while (node) {
		if (['BR', 'DIV'].includes(node.nodeName)) {
			text = "\n" + text
		}
		if (node.textContent?.length) {
			text = node.textContent + text
		}
		node = previousNode(node)
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
			if (event.altKey || event.ctrlKey || event.shiftKey) return
			const selection = getSelection()
			if (selection?.rangeCount !== 1) {
				throw 'Should have range'
			}
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
