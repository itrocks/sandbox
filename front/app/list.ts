import build                        from '../../node_modules/@itrocks/build/build.js'
import { xTargetCall }              from '../../node_modules/@itrocks/xtarget/xtarget.js'
import TableFreeze                  from '../../node_modules/@itrocks/table/freeze.js'
import TableFreezeInheritBackground from '../../node_modules/@itrocks/table/freeze/inherit-background.js'
import TableFreezeInheritBorder     from '../../node_modules/@itrocks/table/freeze/inherit-border.js'
import { tableByElement }           from '../../node_modules/@itrocks/table/table.js'

build<HTMLTableElement>(
	'article[data-action="list"] > form > table.objects',
	element => {
		tableByElement(element, { plugins: [ TableFreeze, TableFreezeInheritBackground, TableFreezeInheritBorder ] })
		element.querySelector(':scope > tbody')?.addEventListener('click', async event =>
		{
			const td = event.target
			if (!(td instanceof HTMLTableCellElement)) return
			const tr = td.closest('tr')
			if (!tr) return
			let select = td.closest('.select')
			if (select) {
				const input = select.querySelector('input')
				if (!input) return
				input.click()
				input.focus()
				return
			}
			select = tr.querySelector<HTMLInputElement>(':scope > th.select > input[name^="id["]')
			if (!select) return
			const id = select.getAttribute('name')?.slice(3, -1)
			if (!id) return
			const form = tr.closest('form')
			if (!form) return
			await xTargetCall(form.getAttribute('action') + '/' + id, 'main')
		})
	}
)
