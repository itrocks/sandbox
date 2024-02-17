import ColumnReorderTable           from '../column-reorder-table.js'
import FixTable                     from '../fix-table.js'
import FixTableInheritBackground    from '../fix-table-inherit-background.js'
import FixTableInheritBorder        from '../fix-table-inherit-border.js'
import { tableBySelector, Options } from '../table.js'
import TableEdit                    from '../table-edit.js'
import TableEditLock                from '../table-edit-lock.js'
import TableEditMove                from '../table-edit-move.js'

const options: Partial<Options> = {
	plugins: [
		ColumnReorderTable,
		FixTable,
		FixTableInheritBackground,
		FixTableInheritBorder,
		TableEdit,
		TableEditLock,
		TableEditMove
	]
}

let tables = tableBySelector('table', options)

addEventListener('resize', () => { tables = tables.map(table => table.reset()) })
