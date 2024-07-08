import build                     from '../build.js'
import FixTable                  from '../fix-table.js'
import FixTableInheritBackground from '../fix-table-inherit-background.js'
import FixTableInheritBorder     from '../fix-table-inherit-border.js'
import { tableByElement }        from '../table.js'
import { xTargetCall }           from '../xtarget.js'

build<HTMLTableElement>(
	'article[data-action="list"] > form > table.objects',
	element => {
		tableByElement(element, { plugins: [ FixTable, FixTableInheritBackground, FixTableInheritBorder ] })
		element.querySelector(':scope > tbody')?.addEventListener('click', async event =>
		{
			const td = event.target
			if (!(td instanceof HTMLTableCellElement)) return
			const tr = td.closest('tr')
			if (!tr) return
			const select = tr.querySelector<HTMLInputElement>(':scope > th.select > input[name=select]')
			if (!select) return
			const id = select.getAttribute('value')
			if (!id) return
			const form = tr.closest('form')
			if (!form) return
			await xTargetCall(form.getAttribute('action') + id, 'main')
		})
	}
)
