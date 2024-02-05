import { fixTableBySelector } from '../fix-table.js'
import InheritBackground from '../fix-table-inherit-background.js'
import InheritBorder from '../fix-table-inherit-border.js'

const initTable = () => fixTableBySelector('table', { plugins: [InheritBackground, InheritBorder] })
addEventListener('resize', initTable)
initTable()
