import FixTable from './fix-table.js'
import Table    from './table'

/**
 * This plugin has no use and no effect if your table has border-collapse: collapse
 */
export class InheritBackground extends FixTable
{
	tableStyle: CSSStyleDeclaration

	constructor(table: Table)
	{
		super(table)
		this.tableStyle = getComputedStyle(table.element)
	}

	init()
	{
		if (this.tableStyle.borderCollapse !== 'separate') return
		const table = this.table

		if (this.tableStyle.backgroundColor.replaceAll(' ', '').endsWith(',0)')) return
		const borderSpacing = parseFloat(this.tableStyle.borderSpacing)
		if (!borderSpacing) return

		let selectors = []
		for (let child = 1; child <= this.leftColumnCount; child ++) {
			selectors.push(`${table.selector} > tbody > tr > :nth-child(${child})`)
		}
		for (let child = 1; child <= this.rightColumnCount; child ++) {
			selectors.push(`${table.selector} > tbody > tr > :nth-last-child(${child})`)
		}
		if (table.element.tFoot?.rows.length) {
			selectors.push(`${table.selector} > tfoot > tr > *`)
		}
		if (table.element.tHead?.rows.length) {
			selectors.push(`${table.selector} > thead > tr > *`)
		}

		if (!selectors.length) return
		table.styleSheet.push(`
			${selectors.join(', ')} {
				box-shadow: 0 0 0 ${borderSpacing}px ${this.tableStyle.backgroundColor};
			}
		`)
	}

}
export default InheritBackground
