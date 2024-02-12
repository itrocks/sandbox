import Table from './table.js'

let keyUpEvent: () => void
let selected: HTMLTableCellElement
let selectedStyle: string

export default class TableEdit extends Table
{

	TableEdit()
	{
		this.styleSheet.push(`
			${this.selector} > * > tr > * {
				cursor: text;
			}
			${this.selector} > tbody > tr {
				position: relative;
			}
		`)

		this.element.addEventListener('mousedown', event => {
			if (!(event.target instanceof Element)) return

			const cell = event.target.closest('td, th') as HTMLTableCellElement
			if (cell === selected) return

			if (selected) {
				selected.removeEventListener('keyup', keyUpEvent)
				selected.removeAttribute('contenteditable')
				if (selectedStyle.length) {
					selected.setAttribute('style', selectedStyle)
				}
				else {
					selected.removeAttribute('style')
				}
			}
			this.reset()
			selected = cell
			if (!selected) return
			selectedStyle = selected.getAttribute('style') ?? ''

			const computedStyle = getComputedStyle(selected)
			const selectedGroup = selected.parentElement?.parentElement?.tagName
			const selectedRect  = selected.getBoundingClientRect()
			const setStyle: Partial<CSSStyleDeclaration> = {}

			// input-like behaviour on overflow
			setStyle.overflow = 'hidden'
			setStyle.display  = 'block'
			// fixed cell width
			setStyle.boxSizing = 'border-box'
			// keep same padding when scrolling
			setStyle.scrollPaddingLeft  = computedStyle.paddingLeft
			setStyle.scrollPaddingRight = computedStyle.paddingRight
			// body non-sticky cell
			if (computedStyle.position !== 'sticky') {
				setStyle.position = 'relative'
			}
			// body cells, sticky or not
			if (selectedGroup === 'TBODY') {
				setStyle.paddingBottom = (parseFloat(computedStyle.paddingBottom) + 1) + 'px'
				setStyle.paddingTop    = (parseFloat(computedStyle.paddingTop) + 1) + 'px'
			}
			// body sticky cell
			if ((selectedGroup === 'TBODY') && (computedStyle.position === 'sticky')) {
				setStyle.position = 'absolute'
			}
			// foot/head cell (all sticky)
			if (selectedGroup !== 'TBODY') {
				setStyle.left     = selectedRect.left + 'px'
				setStyle.height   = selectedRect.height + 'px'
				setStyle.position = 'fixed'
				setStyle.top      = selectedRect.top + 'px'
			}
			// body/foot/head sticky cell
			if (computedStyle.position === 'sticky') {
				setStyle.width = selectedRect.width + 'px'
			}

			keyUpEvent = () => this.reset()
			selected.addEventListener('keyup', keyUpEvent)
			selected.setAttribute('contenteditable', '')
			selected.style.cssText = Object.entries(setStyle)
				.map(([index, value]) => index.replace(/([A-Z])/g, '-$1').toLowerCase() + ': ' + value + ';')
				.join(' ')
		})
	}

}
