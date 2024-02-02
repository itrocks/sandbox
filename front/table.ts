import loadCss from './load-css.js'

await loadCss(import.meta.url)

function countColumns(cols: NodeListOf<HTMLTableColElement>)
{
	let count = { first: 0, last: 0 }
	let doing: 'first'|'last' = 'first'
	let fix = true
	cols.forEach(col => {
		if (fix) {
			if (col.dataset.fix === undefined) {
				fix = false
			}
		}
		else if (col.dataset.fix !== undefined) {
			doing = 'last'
			fix   = true
		}
		if (fix) {
			count[doing] ++
		}
	})
	return count
}

function fixColumns(cols: NodeListOf<HTMLTableColElement>, styleSheet: CSSStyleSheet)
{
	const { first, last } = countColumns(cols)
	if (first) fixFirstColumns(cols, first, styleSheet)
	if (last) fixLastColumns(cols, last, styleSheet)
}

function fixFirstColumns(cols: NodeListOf<HTMLTableColElement>, count: number, styleSheet: CSSStyleSheet)
{
	Array.from(cols).toSpliced(count).forEach((col, count) => console.log('fix first column', count))
}

function fixLastColumns(cols: NodeListOf<HTMLTableColElement>, count: number, styleSheet: CSSStyleSheet)
{
	Array.from(cols).reverse().toSpliced(count).forEach((col, count) => console.log('fix last column', count))
}

function fixRows(table: HTMLTableElement, styleSheet: CSSStyleSheet)
{
	const sections: { tfoot?: HTMLTableRowElement[], thead?: NodeListOf<HTMLTableRowElement> } = {}
	if (table.tFoot) {
		sections.tfoot = Array.from(table.querySelectorAll<HTMLTableRowElement>(':scope > tfoot > tr')).reverse()
	}
	if (table.tHead) {
		sections.thead = table.querySelectorAll<HTMLTableRowElement>(':scope > thead > tr')
	}
	Object.entries(sections).forEach(([section, rows]) => {
		let [ counter, increment, style ] = (section === 'tfoot') ? [ 2, -1, 'bottom' ] : [ 2, 1, 'top' ]
		let [ height, position ] = [ .0, .0 ]
		rows.forEach(row => {
			position += height
			height = parseFloat(window.getComputedStyle(row).height)
			if (position) {
				styleSheet.insertRule(
					`table.itrocks > ${section} > tr:nth-child(${counter}) > * { ${style}: ${position}px; }`
				)
				counter += increment
			}
		})
	})
}

export default (selector: string) =>
{
	const styleSheet = new CSSStyleSheet()
	document.body.querySelectorAll<HTMLTableElement>(selector).forEach(table => {
		table.classList.add('itrocks')
		fixColumns(table.querySelectorAll<HTMLTableColElement>(':scope > colgroup > col'), styleSheet)
		fixRows(table, styleSheet)
	})
	document.adoptedStyleSheets.push(styleSheet)
}
