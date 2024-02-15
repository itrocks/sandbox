import Table from './table.js'

let selected:      HTMLTableCellElement|null = null
let selectedStyle: string = ''
let selectedText:  string = ''

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
		editable.innerHTML = selected.innerHTML

		if (computedStyle.verticalAlign === 'middle') {
			editable.style.lineHeight = computedStyle.height
		}
		editable.style.paddingBottom = computedStyle.paddingBottom
		editable.style.paddingLeft   = computedStyle.paddingLeft
		editable.style.paddingRight  = computedStyle.paddingRight
		editable.style.paddingTop    = computedStyle.paddingTop

		return editable
	}

	editable()
	{
		return selected?.firstElementChild as HTMLDivElement ?? null
	}

	selectCell(cell: HTMLTableCellElement)
	{
		if (cell === selected) return
		this.unselectCell()
		if (!cell) return
		selected     = cell
		selectedText = cell.innerHTML

		const computedStyle = getComputedStyle(selected)
		selectedStyle       = selected.getAttribute('style') ?? ''

		selected.setAttribute('contenteditable', '')
		setTimeout(() => {
			if (!selected) {
				console.error('cell:', cell)
				throw 'Unexpected failure: cell was unselected before contenteditable was set'
			}
			const offset = getSelection()?.anchorOffset
			selected.removeAttribute('contenteditable')
			const editable = this.createEditable(computedStyle) as HTMLDivElement
			selected.replaceChildren(editable)

			selected.classList.add('editing')
			selected.style.padding = '0'
			selected.style.zIndex  = '5'

			const range = document.createRange()
			if (editable.firstChild && offset) {
				range.setStart(editable.firstChild, offset)
				range.setEnd(editable.firstChild, offset)
			}
			else {
				range.selectNodeContents(editable)
			}
			getSelection()?.removeAllRanges()
			getSelection()?.addRange(range)

			editable.addEventListener('keyup', event => this.selectText((event.target as HTMLDivElement)?.innerHTML ?? ''))
		})
	}

	selectText(newText: string)
	{
		if (newText === selectedText) return
		selectedText = newText
		this.reset()
	}

	selected()
	{
		return selected
	}

	TableEdit()
	{
		this.styleSheet.push(`
			${this.selector} > * > tr > * > div[contenteditable] {
				box-sizing: border-box;
				position: relative;
				z-index: 5;
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
		if (!selected) return
		let innerHTML = (selected.firstElementChild as HTMLDivElement).innerHTML
		if (innerHTML.endsWith('<br>')) {
			innerHTML = innerHTML.substring(0, innerHTML.length - 4)
		}
		selected.innerHTML = innerHTML.replaceAll('<div>', '').replaceAll('</div>', '')
		selected.classList.remove('editing')
		selectedStyle.length
			? selected.setAttribute('style', selectedStyle)
			: selected.removeAttribute('style')
		this.selectText(selected.innerHTML)
		selected = null
	}

}
