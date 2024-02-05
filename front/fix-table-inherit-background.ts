import { FixTable } from './fix-table.js'

class InheritBackground extends FixTable
{

	styleInheritBackground()
	{
		this.styleSheet.insertRule(`
			${this.selector} > * > tr > * {
				background: var(--background);
			}
		`)
		return this
	}

}

export default function inheritBackground(table: FixTable)
{
	Object.defineProperty(
		FixTable.prototype,
		'styleInheritBackground',
		Object.getOwnPropertyDescriptor(InheritBackground.prototype, 'styleInheritBackground') as PropertyDescriptor
	);
	(table as InheritBackground).styleInheritBackground()
}
