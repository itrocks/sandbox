import { FixTable } from './fix-table.js'

export default class InheritBorder extends FixTable
{

	position(position: number, counter?: number)
	{
		const result = ((counter === undefined) ? position : (counter > 2))
			? `calc(${position}px + var(--border-width))`
			: `${position}px`
		console.log(position, counter, result)
		return result
	}

	InheritBorder()
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
