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
			const requestInit: RequestInit = { headers: { Accept: 'application/json' } }
			const summaryRoute = input.getAttribute('data-fetch') + '?startsWith=' + text
			fetch(summaryRoute, requestInit).then(response => response.text()).then((json) => {
				const summary     = JSON.parse(json) as [string, string][]
				const startsWith  = input.value.toLowerCase()
				const suggestions = summary.map(([id, summary]) => ({ label: summary, value: Number(id) }))
					.filter(item => item.label.toLowerCase().startsWith(startsWith))
				update(suggestions)
			})
		},

		minLength: 0,

		onSelect: (item: Item, input: HTMLInputElement | HTMLTextAreaElement) =>
		{
			if (item.value) (input.nextElementSibling as HTMLInputElement).value = item.value.toString()
			if (item.label) input.value = item.label
		},

		preventSubmit: PreventSubmit.OnSelect
	})
}
