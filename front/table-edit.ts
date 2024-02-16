import Table from './table.js'

let editable:      HTMLDivElement|null = null
let selected:      HTMLTableCellElement|null = null
let selectedStyle: string = ''
let selectedText:  string = ''

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
		const range = new Range()
		range.setStart(this.startContainer, this.startOffset)
		range.setEnd(this.endContainer, this.endOffset)
		return range
	}

}

export function closestEditable(node: Node|Range|RangeCopy): HTMLDivElement
{
	if ((node instanceof Range) || (node instanceof RangeCopy)) {
		node = node.commonAncestorContainer
	}
	let parent:Node|null = node
	while (parent && !((parent instanceof Element) && parent.hasAttribute('contenteditable'))) {
		parent = parent.parentNode
	}
	if (!parent) {
		throw 'Called from a node outside of contenteditable'
	}
	return parent as HTMLDivElement
}

export function editableEndRange(node: Node|Range|RangeCopy)
{
	node = closestEditable(node)
	while (node.lastChild && !(node.nodeType === Node.TEXT_NODE)) {
		node = node.lastChild as Node
	}
	const newRange = new Range()
	newRange.setStartAfter(node)
	newRange.setEndAfter(node)
	return newRange
}

export function editableFullRange(node: Node|Range|RangeCopy)
{
	const newRange = new Range()
	newRange.selectNodeContents(closestEditable(node))
	return newRange
}

export function getSelectionRange()
{
	const selection = getSelection()
	if (!selection) throw 'Should be called only when there is a selection'
	const range = selection?.getRangeAt(0)
	if (!range) throw 'Should be called only when there is a selection range'
	return range
}

export function inEditable(node: Node|Range|RangeCopy): boolean
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

export function setSelectionRange(range: Range)
{
	const selection = getSelection()
	if (!selection) throw 'Should be called only when there is a selection'
	selection.removeAllRanges()
	selection.addRange(range)
}

export class TableEdit extends Table
{

	closestEditableCell(target: any)
	{
		return (target instanceof Element)
			? target.closest('table.itrocks > * > tr > *, table.itrocks > * > tr > *') as HTMLTableCellElement|null
			: null
	}

	createEditable(computedStyle: CSSStyleDeclaration)
	{
		if (!selected) return null

		const editable = document.createElement('div') as HTMLDivElement
		editable.setAttribute('contenteditable', '')

		editable.style.minHeight     = computedStyle.height
		editable.style.paddingBottom = computedStyle.paddingBottom
		editable.style.paddingLeft   = computedStyle.paddingLeft
		editable.style.paddingRight  = computedStyle.paddingRight
		editable.style.paddingTop    = computedStyle.paddingTop

		return editable
	}

	editable()
	{
		return editable
	}

	scrollToCell(cell: HTMLTableCellElement)
	{
		const into = this.visibleInnerRect()
		const rect = cell.getBoundingClientRect()
		if (
			(rect.left >= into.left)
			&& (rect.top >= into.top)
			&& (rect.right <= into.right)
			&& (rect.bottom <= into.bottom)
		) {
			return false
		}

		let parent = cell.closest('table')?.parentElement
		while (parent && parent.scrollHeight < parent.clientHeight) {
			parent = parent.parentElement
		}
		if (!parent) return
		const scrollable = (parent === document.body) ? window : parent

		let shiftLeft = 0
		let shiftTop  = 0
		if (rect.bottom > into.bottom) {
			shiftTop = rect.bottom - into.bottom
		}
		if (rect.right > into.right) {
			shiftLeft = rect.right - into.right
		}
		if (rect.left < into.left) {
			shiftLeft = rect.left - into.left
		}
		if (rect.top < into.top) {
			shiftTop = rect.top - into.top
		}

		if (!shiftLeft && !shiftTop) {
			return false
		}

		if (getComputedStyle(cell).position === 'sticky') {
			if ((getComputedStyle(cell).left !== 'auto') || (getComputedStyle(cell).right !== 'auto')) {
				shiftLeft = 0
			}
			if ((getComputedStyle(cell).top !== 'auto') || (getComputedStyle(cell).bottom !== 'auto')) {
				shiftTop = 0
			}
		}

		scrollable.scrollBy(shiftLeft, shiftTop)
		return true
	}

	selectCell(cell: HTMLTableCellElement)
	{
		if (cell === selected) return
		this.unselectCell()
		if (!cell) return
		selected     = cell
		selectedText = cell.innerHTML

		this.scrollToCell(cell)

		const computedStyle = getComputedStyle(selected)
		selectedStyle       = selected.getAttribute('style') ?? ''

		selected.setAttribute('contenteditable', '')
		setTimeout(() => {
			if (!selected) {
				console.error('cell:', cell)
				throw 'Unexpected failure: cell was unselected before contenteditable was effective'
			}
			const range = new RangeCopy(getSelectionRange())

			selected.removeAttribute('contenteditable')
			editable = this.createEditable(computedStyle) as HTMLDivElement
			while (selected.childNodes.length) {
				editable.appendChild(selected.childNodes[0])
			}
			selected.replaceChildren(editable)

			selected.style.padding = '0'
			if (computedStyle.position === 'sticky') {
				selected.style.zIndex = '2'
			}

			setSelectionRange(inEditable(range) ? range.toRange() : editableFullRange(editable))

			editable.addEventListener(
				'keyup', event => this.setSelectedText((event.target as HTMLDivElement)?.innerHTML ?? '')
			)
		})
	}

	selected()
	{
		return selected
	}

	protected setSelectedText(newText: string)
	{
		if (newText === selectedText) return
		selectedText = newText
		this.reset()
	}

	TableEdit()
	{
		this.styleSheet.push(`
			${this.selector} > * > tr > * > div[contenteditable] {
				position: relative;
				z-index: 1;
			}
		`)
		this.addEventListener(this.element, 'mousedown', event => {
			const cell = this.closestEditableCell(event.target)
			if (!cell) return
			this.selectCell(cell)
		})
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
		editable = null
		selected = null
	}

}
export default TableEdit
