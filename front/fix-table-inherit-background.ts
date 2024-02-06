import FixTable from './fix-table.js'

export default class InheritBackground extends FixTable
{

	protected InheritBackground()
	{
		const tableStyle = getComputedStyle(this.element)
		if (tableStyle.background === 'none') return
		const borderSpacing = parseFloat(tableStyle.borderSpacing)
		if (this.borderCollapse || !borderSpacing) return

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
