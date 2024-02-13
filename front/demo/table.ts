import ColumnReorderTable  from '../column-reorder-table.js'
import FixTable            from '../fix-table.js'
import InheritBackground   from '../fix-table-inherit-background.js'
import InheritBorder       from '../fix-table-inherit-border.js'
import { tableBySelector } from '../table.js'
import TableEdit           from '../table-edit.js'

let tables = tableBySelector('table', { plugins: [
	ColumnReorderTable,
	FixTable,
	InheritBackground,
	InheritBorder,
	TableEdit
]})

addEventListener('resize', () => { tables = tables.map(table => table.reset()) })
