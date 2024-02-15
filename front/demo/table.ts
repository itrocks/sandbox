import ColumnReorderTable                      from '../column-reorder-table.js'
import FixTable                                from '../fix-table.js'
import FixTableInheritBackground               from '../fix-table-inherit-background.js'
import FixTableInheritBorder                   from '../fix-table-inherit-border.js'
import { tableBySelector, TableOptions }       from '../table.js'
import TableEdit                               from '../table-edit.js'
import { TableEditLock, TableEditLockOptions } from '../table-edit-lock.js'
import TableEditMove                           from '../table-edit-move.js'

const options: Partial<TableEditLockOptions&TableOptions> = {
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
