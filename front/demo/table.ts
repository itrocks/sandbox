import { fixTableBySelector } from '../fix-table.js'
import InheritBackground from '../fix-table-inherit-background.js'
import InheritBorder from '../fix-table-inherit-border.js'

addEventListener('resize', () => fixTableBySelector('table', { plugins: [InheritBackground, InheritBorder] }))
dispatchEvent(new Event('resize'))
