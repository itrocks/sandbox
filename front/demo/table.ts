import ColumnReorderTable           from '../column-reorder-table.js'
import FixTable                     from '../fix-table.js'
import FixTableInheritBackground    from '../fix-table-inherit-background.js'
import FixTableInheritBorder        from '../fix-table-inherit-border.js'
import { tableBySelector, Options } from '../table.js'
import TableEdit                    from '../table-edit.js'
import TableEditFixHide             from '../table-edit-fix-hide.js'
import TableEditLock                from '../table-edit-lock.js'
import TableEditMove                from '../table-edit-move.js'
import TableEditScroll              from '../table-edit-scroll.js'

const options: Partial<Options> = {
	plugins: [
		ColumnReorderTable,
		FixTable,
		FixTableInheritBackground,
		FixTableInheritBorder,
		TableEdit,
		TableEditFixHide,
		TableEditLock,
		TableEditMove,
		TableEditScroll
	]
}

let tables = tableBySelector('table', options)

addEventListener('resize', () => { tables = tables.map(table => table.reset()) })
