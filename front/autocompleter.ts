import autocomplete from '../node_modules/autocompleter/autocomplete.es.js'
import loadCss      from './load-css.js'

export default function autoCompleter(input: HTMLInputElement)
{
	loadCss('/node_modules/autocompleter/autocomplete.css')
	const countries = [
		{ label: 'France', value: 'FR' },
		{ label: 'United Kingdom', value: 'UK' },
		{ label: 'United States', value: 'US' }
	];
	autocomplete({
		input,
		fetch: (text, update) => {
			text = text.toLowerCase()
			// you can also use AJAX requests instead of preloaded data
			const suggestions = countries.filter(n => n.label.toLowerCase().startsWith(text))
			update(suggestions)
		},
		minLength: 0,
		onSelect: (item, input: HTMLInputElement | HTMLTextAreaElement) => {
			if (item.label) input.value = item.label
		}
	})
}
