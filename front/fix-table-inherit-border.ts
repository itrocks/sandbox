import { FixTable } from './fix-table.js'

class InheritBorder extends FixTable
{

	styleInheritBorder()
	{
		[`
			${this.selector} {
				border: var(--border-width) var(--border-style) var(--border-color);
				border-spacing: 0;
			}
		`, `
			${this.selector} > * > tr > * {
				border-right: var(--border-width) var(--border-style) var(--border-color);
				border-top: var(--border-width) var(--border-style) var(--border-color);
			}
		`, `
			${this.selector} > * > tr > :last-child {
				border-right: 0;
			}
		`, `
			${this.selector} > tbody > tr:first-child > *,
			${this.selector} > thead > tr:first-child > * {
				border-top: 0;
			}
		`, `
			${this.selector} > thead > tr:last-child > * {
				border-bottom: var(--border-width) var(--border-style) var(--border-color);
			}
		`].forEach(rule => this.styleSheet.push(rule))
		const all1Sel: string[] = []
		const all2Sel: string[] = []
		for (let counter = 1; counter <= this.fixColumnRightCount; counter ++) {
			all1Sel.push(`${this.selector} > * > tr > :nth-last-child(${counter})`)
			all2Sel.push(`${this.selector} > * > tr > :nth-last-child(${counter + 1})`)
		}
		this.styleSheet.push(`
			${all1Sel.join(', ')} {
				border-left: var(--border-width) var(--border-style) var(--border-color);
			}
		`)
		this.styleSheet.push(`
			${all2Sel.join(', ')} {
				border-right: none;
			}
		`)
		return this
	}

}

export default function inheritBackground(table: FixTable)
{
	Object.defineProperty(
		FixTable.prototype,
		'styleInheritBorder',
		Object.getOwnPropertyDescriptor(InheritBorder.prototype, 'styleInheritBorder') as PropertyDescriptor
	);
	(table as InheritBorder).styleInheritBorder()
}
