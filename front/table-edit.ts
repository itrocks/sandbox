import Table from './table.js'

let selected:      HTMLTableCellElement
let selectedStyle: string

function selectCell(table: TableEdit, cell: HTMLTableCellElement|undefined)
{
	if (cell === selected) return
	unselectCell(table)
	if (!cell) return
	selected = cell

	const computedStyle = getComputedStyle(selected)
	selectedStyle = selected.getAttribute('style') ?? ''

	selected.setAttribute('contenteditable', '')
	setTimeout(() => {
		const offset = getSelection()?.anchorOffset
		selected.removeAttribute('contenteditable')

		selected.innerHTML = '<div contenteditable>' + selected.innerHTML + '</div>'
		const editable = selected.firstElementChild as HTMLDivElement

		if (computedStyle.verticalAlign === 'middle') {
			editable.style.lineHeight = computedStyle.height
		}
		editable.style.boxSizing         = 'border-box'
		editable.style.paddingBottom     = computedStyle.paddingBottom
		editable.style.paddingLeft       = computedStyle.paddingLeft
		editable.style.paddingRight      = computedStyle.paddingRight
		editable.style.paddingTop        = computedStyle.paddingTop
		editable.style.scrollPaddingLeft = computedStyle.paddingLeft

		selected.classList.add('editing')
		selected.style.padding = '0'

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

		editable.addEventListener('keyup', () => table.reset())
	})
}

function unselectCell(table: TableEdit)
{
	if (!selected) return
	let innerHTML = (selected.firstElementChild as HTMLDivElement).innerHTML
	if (innerHTML.endsWith('<br>')) {
		innerHTML = innerHTML.substring(0, innerHTML.length - 4)
	}
	selected.classList.remove('editing')
	selected.innerHTML = innerHTML
	selectedStyle.length
		? selected.setAttribute('style', selectedStyle)
		: selected.removeAttribute('style')
	table.reset()
}

export default class TableEdit extends Table
{

	TableEdit()
	{
		this.addEventListener(this.element, 'mousedown', event => {
			if (!(event.target instanceof Element)) return
			selectCell(this, event.target.closest('td, th') as HTMLTableCellElement|undefined)
		})
	}

}
