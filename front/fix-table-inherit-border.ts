import FixTable                               from './fix-table.js'
import { HTMLTableFixElement, Plugin, Table } from './table.js'

/**
 * This plugin has no use and no effect if your table has border-collapse: separate (default)
 */
export default class InheritBorder extends Plugin
{
	tableStyle: CSSStyleDeclaration
	fixTable:   FixTable

	constructor(table: Table)
	{
		super(table)
		this.fixTable = table.plugins.FixTable as FixTable

		this.tableStyle = getComputedStyle(table.element)
		if (this.tableStyle.borderCollapse !== 'collapse') return

		const original         = this.fixTable.position
		this.fixTable.position = (position, counter, row, side) => original.call(
			this.table.plugins.FixTable, this.position(position, counter, row, side), counter, row, side
		)
	}

	init()
	{
		if (this.tableStyle.borderCollapse !== 'collapse') return
		const fixTable = this.fixTable
		const table    = this.table

		// table
		table.styleSheet.push(`
			${table.selector} {
				border-collapse: separate;
				border-spacing: 0;
			}
		`)
		// columns
		let rightSelector = '';
		if (fixTable.rightColumnCount) {
			rightSelector = `:not(:nth-last-child(${fixTable.rightColumnCount}))`;
			table.styleSheet.push(`
				${table.selector} > * > tr > :nth-last-child(${fixTable.rightColumnCount + 1}) {
					border-right-width: 0;
				}
			`)
		}
		table.styleSheet.push(`
			${table.selector} > * > tr > :not(:first-child)${rightSelector} {
				border-left-width: 0;
			}
		`)
		// rows
		if (table.element.tHead?.rows.length) {
			table.styleSheet.push(`
				${table.selector} > tbody > tr > *,
				${table.selector} > thead > tr:not(:first-child) > * {
					border-top-width: 0;
				}
			`)
		}
		else {
			table.styleSheet.push(`
				${table.selector} > tbody > tr:not(:first-child) > * {
					border-top-width: 0;
				}
			`)
		}
		if (table.element.tFoot?.rows.length) {
			table.styleSheet.push(`
				${table.selector} > tbody > tr:last-child > *,
				${table.selector} > tfoot > tr:not(:last-child) > * { 
					border-bottom-width: 0;
				}
			`)
		}
	}

	position(position: number, counter: number, row: HTMLTableFixElement, side: 'bottom'|'left'|'right'|'top')
	{
		const width = parseFloat(getComputedStyle(row).borderWidth) / 2
		const shift = (counter > 1) ? width : -width
		position += (side === 'bottom') || (side === 'right')
			? Math.ceil(shift)
			: Math.floor(shift)
		return position
	}

}
