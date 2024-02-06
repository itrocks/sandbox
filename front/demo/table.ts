import FixTable            from '../fix-table.js'
import InheritBackground   from '../fix-table-inherit-background.js'
import InheritBorder       from '../fix-table-inherit-border.js'
import { tableBySelector } from '../table.js'

addEventListener('resize', () => tableBySelector('table', { plugins: [
	FixTable,
	InheritBackground,
	InheritBorder
]}))
dispatchEvent(new Event('resize'))
