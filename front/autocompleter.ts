import autocomplete      from '../node_modules/autocompleter/autocomplete.es.js'
import { PreventSubmit } from '../node_modules/autocompleter/autocomplete.es.js'
import loadCss           from './load-css.js'

type Item = {
	label: string,
	value: number
}

export default function autoCompleter(input: HTMLInputElement)
{
	loadCss('/app/style/2020/autocompleter.css')
	loadCss('/node_modules/autocompleter/autocomplete.css')

	autocomplete({
		input,

		fetch: (text, update) =>
		{
			const dataFetch = input.dataset.fetch ?? input.closest<HTMLElement>('[data-fetch]')?.dataset.fetch
			const requestInit: RequestInit = { headers: { Accept: 'application/json' } }
			const summaryRoute = dataFetch + '?startsWith=' + text
			fetch(summaryRoute, requestInit).then(response => response.text()).then((json) => {
				const summary     = JSON.parse(json) as [string, string][]
				const startsWith  = input.value.toLowerCase()
				const suggestions = summary.map(([id, summary]) => ({ label: summary, value: +id }))
					.filter(item => item.label.toLowerCase().startsWith(startsWith))
				update(suggestions)
			})
		},

		minLength: 0,

		onSelect: (item: Item, input: HTMLInputElement | HTMLTextAreaElement) =>
		{
			if (item.value) {
				if (input.nextElementSibling instanceof HTMLInputElement) {
					input.nextElementSibling.value = item.value + ''
				}
				else {
					let dotPosition = input.id.lastIndexOf('.')
					const name = (dotPosition < 0) ? input.id : input.id.slice(0, dotPosition)
					input.id = input.name = name + '.' + item.value
				}
			}
			if (item.label) {
				input.value = item.label
				input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
			}
		},

		preventSubmit: PreventSubmit.OnSelect
	})
}

export function multiple(list: HTMLUListElement)
{
	list.querySelectorAll<HTMLInputElement>('input').forEach(autoCompleter)
}
