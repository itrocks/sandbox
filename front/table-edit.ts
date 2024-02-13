import Table from './table.js'

let keyUpEvent:       () => void
let selected:         HTMLTableCellElement
let selectedCol:      HTMLTableColElement|HTMLTableCellElement
let selectedColStyle: string
let selectedStyle:    string

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

function editStyle()
{
	const computedStyle = getComputedStyle(selected)
	const editStyle: Partial<CSSStyleDeclaration> = {}
	const selectedGroup = selected.parentElement?.parentElement?.tagName
	const selectedRect  = selected.getBoundingClientRect()

	// keep same padding when scrolling
	editStyle.scrollPaddingLeft  = computedStyle.paddingLeft
	editStyle.scrollPaddingRight = computedStyle.paddingRight
	// body cells, sticky or not
	if (selectedGroup === 'TBODY') {
		editStyle.paddingBottom = (parseFloat(computedStyle.paddingBottom) + 1) + 'px'
		editStyle.paddingTop    = (parseFloat(computedStyle.paddingTop) + 1) + 'px'
		editStyle.position = (computedStyle.position === 'sticky') ? 'absolute' : 'relative'
	}
	// foot/head cell (all sticky)
	else {
		editStyle.height = selectedRect.height + 'px'
		editStyle.left   = selectedRect.left + 'px'
		editStyle.top    = selectedRect.top + 'px'
	}
	editStyle.width = selectedRect.width + 'px'

	selectedCol.style.boxSizing = 'border-box'
	selectedCol.style.maxWidth  = selectedRect.width + 'px'
	selectedCol.style.minWidth  = selectedRect.width + 'px'
	selectedCol.style.width     = selectedRect.width + 'px'

	return editStyle
}

function topForeignRowCell(table: TableEdit, cell: HTMLTableCellElement)
{
	const position = cellPosition(cell)
	const col = table.element.querySelectorAll(':scope > colgroup')[0]
	if (col) {
		return col.children[position - 1] as HTMLTableColElement
	}
	const sections: NodeListOf<HTMLTableSectionElement>
		= table.element.querySelectorAll(':scope > tbody, :scope > tfoot, :scope > thead')
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

function selectCell(table: TableEdit, cell: HTMLTableCellElement|undefined)
{
	if (cell === selected) return undefined
	unselectCell(table)
	if (!cell) return
	selected    = cell
	selectedCol = topForeignRowCell(table, selected)

	selectedColStyle = selectedCol.getAttribute('style') ?? ''
	selectedStyle    = selected.getAttribute('style') ?? ''

	Object.entries(editStyle()).forEach(([index, value]) => {
		// @ts-ignore editStyle() returns Partial<CSSStyleDeclaration>
		selected.style[index] = value
	})
	selected.setAttribute('contenteditable', '')
}

function unselectCell(table: TableEdit)
{
	if (!selected) return
	selected.removeAttribute('contenteditable')
	selected.removeEventListener('keyup', keyUpEvent)
	selectedColStyle.length
		? selectedCol.setAttribute('style', selectedColStyle)
		: selectedCol.removeAttribute('style')
	selectedStyle.length
		? selected.setAttribute('style', selectedStyle)
		: selected.removeAttribute('style')
	table.reset()
}

export default class TableEdit extends Table
{

	protected setEditStyle()
	{
		this.styleSheet.push(`
			${this.selector} > * > tr > * {
				cursor: text;
			}
			${this.selector} > * > tr > [contenteditable] {
				box-sizing: border-box;
				display: block;
				overflow: hidden;
			}
			${this.selector} > tbody > tr {
				position: relative;
			}
			${this.selector} > tfoot > tr > [contenteditable],
			${this.selector} > thead > tr > [contenteditable] {
				position: fixed;
			}
		`)
	}

	TableEdit()
	{
		this.setEditStyle()
		this.addEventListener(this.element, 'mousedown', event => {
			if (event.target instanceof Element)
			selectCell(this, event.target.closest('td, th') as HTMLTableCellElement|undefined)
		})
	}

}
