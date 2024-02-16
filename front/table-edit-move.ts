import TableEdit from './table-edit.js'

function cellPosition(cell: HTMLTableCellElement)
{
	let count = 1
	let previous = cell.previousElementSibling
	while (previous) {
		if (['TD', 'TH'].includes(previous.tagName)) {
			count ++
		}
		previous = previous.previousElementSibling
	}
	return count
}

function editableNode(node: Node|null): Node|null
{
	while (node && !((node instanceof Element) && node.hasAttribute('contenteditable'))) {
		node = node.parentNode
	}
	return node
}

function getSelectionRange()
{
	const selection = getSelection()
	if (!selection) throw 'Should be called only when there is a selection'
	const range = selection?.getRangeAt(0)
	if (!range) throw 'Should be called only when there is a selection range'
	return range
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

function selectFullEditable(range: Range)
{
	const selection = getSelection()
	if (!selection) return null
	let node = editableNode(range.commonAncestorContainer)
	if (!node) return null
	const newRange = new Range()
	newRange.selectNodeContents(node)
	selection.removeAllRanges()
	selection.addRange(newRange)
	return newRange
}

function selectRangeEndOf(range: Range)
{
	const selection = getSelection()
	if (!selection) return null
	let node = editableNode(range.commonAncestorContainer)
	if (!node) return null
	while (node.lastChild && !(node.nodeType === Node.TEXT_NODE)) {
		node = node.lastChild
	}
	const newRange = new Range()
	newRange.setEndAfter(node)
	newRange.collapse()
	selection.removeAllRanges()
	selection.addRange(newRange)
	return newRange
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
					selectFullEditable(getSelectionRange())
					return
				case 'F2':
					const range = getSelectionRange()
					if (
						(range.startContainer instanceof Element)
						&& range.startContainer.hasAttribute('contenteditable')
						&& (range.startContainer === range.commonAncestorContainer)
						&& (range.startContainer === range.endContainer)
					) {
						selectRangeEndOf(range)
					}
					return
			}
		})
		return editable
	}

}
export default TableEditMove
