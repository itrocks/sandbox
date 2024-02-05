import { fixTableBySelector } from '../fix-table.js'
import inheritBackground from '../fix-table-inherit-background.js'
import inheritBorder from '../fix-table-inherit-border.js'

fixTableBySelector('table').forEach(table => {
	inheritBackground(table)
	inheritBorder(table)
})
