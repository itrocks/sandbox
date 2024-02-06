import FixTable from './fix-table.js'

/**
 * This plugin has no use and no effect if your table has border-collapse: collapse
 */
export default class InheritBackground extends FixTable
{

	protected InheritBackground()
	{
		if (this.borderCollapse) return
		const tableStyle = getComputedStyle(this.element)
		if (tableStyle.backgroundColor.replaceAll(' ', '').endsWith(',0)')) return
		const borderSpacing = parseFloat(tableStyle.borderSpacing)
		if (!borderSpacing) return

		let selectors = []
		for (let child = 1; child <= this.leftColumnCount; child ++) {
			selectors.push(`${this.selector} > tbody > tr > :nth-child(${child})`)
		}
		for (let child = 1; child <= this.rightColumnCount; child ++) {
			selectors.push(`${this.selector} > tbody > tr > :nth-last-child(${child})`)
		}
		if (this.element.tFoot) {
			selectors.push(`${this.selector} > tfoot > tr > *`)
		}
		if (this.element.tHead) {
			selectors.push(`${this.selector} > thead > tr > *`)
		}
		this.styleSheet.push(`
			${selectors.join(', ')} {
				box-shadow: 0 0 0 ${borderSpacing}px ${tableStyle.backgroundColor};
			}
		`)
	}

}
