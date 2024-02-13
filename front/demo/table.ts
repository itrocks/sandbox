import ColumnReorderTable        from '../column-reorder-table.js'
import FixTable                  from '../fix-table.js'
import FixTableInheritBackground from '../fix-table-inherit-background.js'
import FixTableInheritBorder     from '../fix-table-inherit-border.js'
import { tableBySelector }       from '../table.js'
import TableEdit                 from '../table-edit.js'

let tables = tableBySelector('table', { plugins: [
	ColumnReorderTable,
	FixTable,
	FixTableInheritBackground,
	FixTableInheritBorder,
	TableEdit
]})

addEventListener('resize', () => { tables = tables.map(table => table.reset()) })
