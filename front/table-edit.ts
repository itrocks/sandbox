import Plugin from './plugin.js'
import Table  from './table.js'

let editable:      HTMLDivElement | undefined
let selected:      HTMLTableCellElement | undefined
let selectedStyle: string
let selectedText:  string

export class RangeCopy
{
	commonAncestorContainer: Node
	endContainer:   Node
	endOffset:      number
	startContainer: Node
	startOffset:    number

	constructor(range: Range)
	{
		this.commonAncestorContainer = range.commonAncestorContainer
		this.endContainer            = range.endContainer
		this.endOffset               = range.endOffset
		this.startContainer          = range.startContainer
		this.startOffset             = range.startOffset
	}

	toRange()
	{
		const range = new Range
		range.setStart(this.startContainer, this.startOffset)
		range.setEnd(this.endContainer, this.endOffset)
		return range
	}

}

export class TableEdit extends Plugin<Table>
{
	zIndex = '2'

	init()
	{
		const table = this.of
		table.styleSheet.push(`
			${table.selector} > * > tr > * > div[contenteditable] {
				position: relative;
				z-index: ${this.zIndex};
			}
		`)
		table.addEventListener(table.element, 'mousedown', event => {
			const cell = this.closestEditableCell(event.target)
			if (!cell) return
			this.selectCell(cell)
		})
	}

	closestEditable(node: Node | Range | RangeCopy): HTMLDivElement
	{
		if ((node instanceof Range) || (node instanceof RangeCopy)) {
			node = node.commonAncestorContainer
		}
		let parent : Element | undefined = (node instanceof Element) ? node : (node.parentElement ?? undefined)
		while (parent && !parent.hasAttribute('contenteditable')) {
			parent = parent.parentElement ?? undefined
		}
		if (!parent) {
			throw 'Called from a node outside of contenteditable'
		}
		return parent as HTMLDivElement
	}

	closestEditableCell(target: any)
	{
		return (target instanceof Element)
			? target.closest('table.itrocks > * > tr > *, table.itrocks > * > tr > *') as HTMLTableCellElement ?? undefined
			: undefined
	}

	createEditable(selected: HTMLTableCellElement, selectedStyle: CSSStyleDeclaration)
	{
		const editable = document.createElement('div') as HTMLDivElement
		editable.setAttribute('contenteditable', '')
		editable.style.minHeight     = selectedStyle.height
		editable.style.paddingBottom = selectedStyle.paddingBottom
		editable.style.paddingLeft   = selectedStyle.paddingLeft
		editable.style.paddingRight  = selectedStyle.paddingRight
		editable.style.paddingTop    = selectedStyle.paddingTop
		editable.addEventListener(
			'keyup', event => this.setSelectedText((event.target as HTMLDivElement)?.innerHTML ?? '')
		)
		while (selected.childNodes.length) {
			editable.appendChild(selected.childNodes[0])
		}
		selected.replaceChildren(editable)
		selected.style.padding = '0'
		if (selectedStyle.position === 'sticky') {
			selected.style.zIndex = this.zIndex
		}
		return editable
	}

	editable()
	{
		return editable
	}

	editableEndRange(node: Node | Range | RangeCopy)
	{
		node = this.closestEditable(node)
		while (node.lastChild && !(node.nodeType === Node.TEXT_NODE)) {
			node = node.lastChild as Node
		}
		const newRange = new Range
		newRange.setStartAfter(node)
		newRange.setEndAfter(node)
		return newRange
	}

	editableFullRange(node: Node | Range | RangeCopy)
	{
		const newRange = new Range
		newRange.selectNodeContents(this.closestEditable(node))
		return newRange
	}

	getSelectionRange()
	{
		const selection = getSelection()
		if (!selection) throw 'Should be called only when there is a selection'
		const range = selection?.getRangeAt(0)
		if (!range) throw 'Should be called only when there is a selection range'
		return range
	}

	inEditable(node: Node | Range | RangeCopy): boolean
	{
		if ((node instanceof Range) || (node instanceof RangeCopy)) {
			node = node.commonAncestorContainer
		}
		return !!(
			(node instanceof Element)
				? node.closest('div[contenteditable]')
				: node.parentElement?.closest('div[contenteditable]')
		)
	}

	/** If cell is not already selected : unselects old cell, then selects this new one */
	selectCell(cell: HTMLTableCellElement)
	{
		if (cell === selected) return
		this.unselectCell()
		this.setSelectedCell(cell)
	}

	/** Returns the currently selected cell, or undefined if no cell is selected */
	selected()
	{
		return selected
	}

	/** Sets selected cell to this cell, and set its content to div[contenteditable] */
	setSelectedCell(cell: HTMLTableCellElement)
	{
		selected     = cell
		selectedText = selected.innerHTML

		const originSelectedStyle = getComputedStyle(selected)
		selectedStyle             = selected.getAttribute('style') ?? ''

		selected.setAttribute('contenteditable', '')
		setTimeout(() => {
			if (!selected) {
				console.error('cell:', cell)
				throw 'Unexpected failure: cell was unselected before contenteditable was effective'
			}
			const range = new RangeCopy(this.getSelectionRange())
			selected.removeAttribute('contenteditable')

			editable = this.createEditable(selected, originSelectedStyle)
			this.setSelectionRange(this.inEditable(range) ? range.toRange() : this.editableFullRange(editable))
		})
	}

	protected setSelectedText(newText: string)
	{
		if (newText === selectedText) return
		selectedText = newText
		this.of.reset()
	}

	setSelectionRange(range: Range)
	{
		const selection = getSelection()
		if (!selection) throw 'Should be called only when there is a selection'
		selection.removeAllRanges()
		selection.addRange(range)
	}

	unselectCell()
	{
		if (!editable || !selected) return
		while (editable.childNodes.length) {
			selected.appendChild(editable.childNodes[0])
		}
		editable.remove()
		selectedStyle.length
			? selected.setAttribute('style', selectedStyle)
			: selected.removeAttribute('style')
		this.setSelectedText(selected.innerHTML)
		editable = undefined
		selected = undefined
	}

}
export default TableEdit
