import { createHash }             from 'crypto'
import { Type }                   from '../../class/type'
import { decorate, decoratorOf }  from '../../decorator/property'
import tr                         from '../../locale/translate'
import { displayOf }              from '../../view/property/display'
import { EDIT, INPUT, UNCHANGED } from './filter'
import { Filter, setFilters }     from './filter'

const PASSWORD = Symbol('password')

const tab = '\n\t\t\t\t'

function editPassword(value: string, type: Type, property: string)
{
	const inputValue = value.length ? ' value="¤~!~!~!~!~¤"' : ''
	const label      = `<label for="${property}">${tr(displayOf(type, property))}</label>`
	const input      = `<input id="${property}" name="${property}" type="password"${inputValue}>`
	return label + tab + input
}

function inputPassword(value: string)
{
	return (value === '¤~!~!~!~!~¤')
		? UNCHANGED
		: createHash('sha512').update(value, 'utf8').digest('hex')
}

export function Password(value = true)
{
	const parent = decorate(PASSWORD, value)
	return value
		? (target: object, property: string) => {
			parent(target, property)
			setFilters(target, property, [
				{ format: 'html', direction: INPUT, filter: inputPassword },
				{ format: 'html', direction: EDIT,  filter: editPassword as Filter },
				{ format: 'html',                   filter: () => '***********' },
				{ format: 'json',                   filter: value => value.length ? '*PASSWORD*' : '*EMPTY*' }
			])
		}
		: parent
}
export default Password

export const passwordOf = (target: object | Type, property: string) =>
	decoratorOf<boolean>(target, property, PASSWORD, false)
