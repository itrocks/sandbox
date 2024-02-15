import FixTable                from './fix-table.js'
import { HTMLTableFixElement } from './table.js'

/**
 * This plugin has no use and no effect if your table has border-collapse: separate (default)
 */
export default class InheritBorder extends FixTable
{

	protected tableStyle: CSSStyleDeclaration

	constructor(element: HTMLTableElement)
	{
		super(element)
		throw 'Plugin should not be instantiated'
	}

	InheritBorderInit()
	{
		this.tableStyle = getComputedStyle(this.element)
		if (this.tableStyle.borderCollapse !== 'collapse') {
			this.position = super.position
		}
	}

	InheritBorder()
	{
		if (this.tableStyle.borderCollapse !== 'collapse') return

		// table
		this.styleSheet.push(`
			${this.selector} {
				border-collapse: separate;
				border-spacing: 0;
			}
		`)
		// columns
		let rightSelector = '';
		if (this.rightColumnCount) {
			rightSelector = `:not(:nth-last-child(${this.rightColumnCount}))`;
			this.styleSheet.push(`
				${this.selector} > * > tr > :nth-last-child(${this.rightColumnCount + 1}) {
					border-right-width: 0;
				}
			`)
		}
		this.styleSheet.push(`
			${this.selector} > * > tr > :not(:first-child)${rightSelector} {
				border-left-width: 0;
			}
		`)
		// rows
		this.styleSheet.push(`
			${this.selector} > tbody > tr > * {
				border-top-width: 0;
			}
			${this.selector} > tbody > tr:last-child > * {
				border-bottom-width: 0;
			}
			${this.selector} > tfoot > tr:not(:last-child) > * {
				border-bottom-width: 0;
			}
			${this.selector} > thead > tr:not(:first-child) > * {
				border-top-width: 0;
			}
		`)
	}

	position(position: number, counter: number, row: HTMLTableFixElement, side: 'bottom' | 'left' | 'right' | 'top')
	{
		const width = parseFloat(getComputedStyle(row).borderWidth) / 2
		const shift = (counter > 1) ? width : -width
		position += ((side === 'bottom') || (side === 'right'))
			? Math.ceil(shift)
			: Math.floor(shift)
		return super.position(position, counter, row, side)
	}

}
