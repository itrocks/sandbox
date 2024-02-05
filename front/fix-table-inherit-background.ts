import { FixTable } from './fix-table.js'

export default class InheritBackground extends FixTable
{

	InheritBackground()
	{
		this.styleSheet.push(`
			${this.selector} > * > tr > * {
				background: var(--background);
			}
		`)
		return this
	}

}
