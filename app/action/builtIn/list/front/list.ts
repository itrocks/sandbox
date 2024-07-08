import build                     from '../../../../../front/build.js'
import FixTable                  from '../../../../../front/fix-table.js'
import FixTableInheritBackground from '../../../../../front/fix-table-inherit-background.js'
import FixTableInheritBorder     from '../../../../../front/fix-table-inherit-border.js'
import { tableByElement }        from '../../../../../front/table.js'
import { xTargetCall }           from '../../../../../front/xtarget.js'

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
