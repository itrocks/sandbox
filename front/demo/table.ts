import ColumnReorderTable           from '../column-reorder-table.js'
import FixTable                     from '../fix-table.js'
import FixTableInheritBackground    from '../fix-table-inherit-background.js'
import FixTableInheritBorder        from '../fix-table-inherit-border.js'
import { tableBySelector, Options } from '../table.js'
import TableEdit                    from '../table-edit.js'
import TableEditFixHide             from '../table-edit-fix-hide.js'
import TableEditFixScroll           from '../table-edit-fix-scroll.js'
import TableEditLock                from '../table-edit-lock.js'
import TableEditMove                from '../table-edit-move.js'

const options: Partial<Options> = {
	plugins: [
		ColumnReorderTable,
		FixTable,
		FixTableInheritBackground,
		FixTableInheritBorder,
		TableEdit,
		TableEditFixHide,
		TableEditFixScroll,
		TableEditLock,
		TableEditMove
	]
}

let tables = tableBySelector('table', options)

addEventListener('resize', () => { setTimeout(() => (tables = tables.map(table => table.reset())))})
