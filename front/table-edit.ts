import Table from './table.js'

let editable:      HTMLDivElement|null = null
let selected:      HTMLTableCellElement|null = null
let selectedStyle: string = ''
let selectedText:  string = ''

export type RangeSelection = {
	cell:        HTMLTableCellElement|null
	endNode:     Node
	endOffset:   number
	startNode:   Node
	startOffset: number
}

export default class TableEdit extends Table
{

	closestEditableCell(target: any)
	{
		return (target instanceof Element)
			? target.closest('td, th') as HTMLTableCellElement|null
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

	}

	selectCell(cell: HTMLTableCellElement)
	{
		if (cell === selected) return
		this.unselectCell()
		if (!cell) return
		selected     = cell
		selectedText = cell.innerHTML

		const rect = selected.getBoundingClientRect()
		if (
			(document.elementFromPoint(rect.left + 1, rect.top + 1) !== selected)
			|| (document.elementFromPoint(rect.right - 1, rect.bottom - 1) !== selected)
		) {
			this.scrollToCell(cell)
		}

		const computedStyle = getComputedStyle(selected)
		selectedStyle       = selected.getAttribute('style') ?? ''

		selected.setAttribute('contenteditable', '')
		setTimeout(() => {
			if (!selected) {
				console.error('cell:', cell)
				throw 'Unexpected failure: cell was unselected before contenteditable was set'
			}
			const range = this.selectedRange()

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

			this.selectRange(range)

			editable.addEventListener(
				'keyup', event => this.setSelectedText((event.target as HTMLDivElement)?.innerHTML ?? '')
			)
		})
	}

	selectRange(range: RangeSelection|null)
	{
		const selection = getSelection()
		if (!selection) return
		const newRange = document.createRange()
		if (newRange && range && (range.cell === selected)) {
			newRange.setStart(range.startNode, range.startOffset)
			newRange.setEnd(range.endNode, range.endOffset)
		}
		else {
			const editable = this.editable()
			if (!editable) return
			newRange.selectNodeContents(editable)
		}
		selection.removeAllRanges()
		selection.addRange(newRange)
	}

	selected()
	{
		return selected
	}

	selectedRange(): RangeSelection|null
	{
		const selection = getSelection()
		if (!selection) return null
		const range  = selection.getRangeAt(0)
		if (!range) return null
		const cell = (range.commonAncestorContainer instanceof Element)
			? range.commonAncestorContainer.closest('td')
			: range.commonAncestorContainer.parentElement?.closest('td') ?? null
		if (cell !== selected) return null

		return {
			cell,
			endNode:     range.endContainer,
			endOffset:   range.endOffset,
			startNode:   range.startContainer,
			startOffset: range.startOffset
		}
	}

	setSelectedText(newText: string)
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
