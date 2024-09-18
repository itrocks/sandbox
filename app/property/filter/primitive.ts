import {FilterType, setFilter, setFilters} from './filter'
import tr from '../../locale/translate'
import {displayOf} from '../../view/property/display'

setFilter('bigint', '', 'html', 'input', value => BigInt(value))

const tab = '\n\t\t\t\t'

function booleanEdit(value: boolean, type: FilterType, property: string): string
{
	if (typeof type === 'string') {
		return String(value)
	}
	const label = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	return label
		+ tab + `<input name="${property}" type="hidden" value="0">`
		+ tab + `<input id="${property}" name="${property}"${value ? ' checked' : ''} type="checkbox" value="1">`
}

setFilters('boolean', '', [
	{
		format:    'html',
		direction: 'edit',
		filter:    booleanEdit
	},
	{
		format:    'html',
		direction: 'input',
		filter:    value => !['', '0', 'false', 'no', tr('false'), tr('no')].includes(value)
	},
	{
		format:    'html',
		direction: 'output',
		filter:    value => value ? tr('yes') : tr('no')
	}
])

setFilter('number', '', 'html', 'input', value => Number(value))
