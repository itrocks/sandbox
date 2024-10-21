import { createHash }            from 'crypto'
import { ObjectOrType, Type }    from '../../class/type'
import { decorate, decoratorOf } from '../../decorator/property'
import tr                        from '../../locale/translate'
import { displayOf }             from '../../view/property/display'
import { Filter, setFilters }    from './filter'
import { EDIT, HTML, INPUT, JSON, UNCHANGED } from './filter'

const PASSWORD = Symbol('password')

const lfTab = '\n\t\t\t\t'

function editPassword(value: string, object: object, property: string)
{
	const inputValue = value.length ? ` value="${UNCHANGED}"` : ''
	const label      = `<label for="${property}">${tr(displayOf(object, property))}</label>`
	const input      = `<input id="${property}" name="${property}" type="password"${inputValue}>`
	return label + lfTab + input
}

function inputPassword(value: string)
{
	return ['', UNCHANGED].includes(value)
		? value
		: createHash('sha512').update(value, 'utf8').digest('hex')
}

export function Password(value = true)
{
	const parent = decorate(PASSWORD, value)
	return value
		? (target: Type, property: string) => {
			parent(target, property)
			setFilters(target, property, [
				{ format: HTML, direction: INPUT, filter: inputPassword },
				{ format: HTML, direction: EDIT,  filter: editPassword as Filter },
				{ format: HTML,                   filter: value => value.length ? '***********' : '' },
				{ format: JSON,                   filter: value => value.length ? '*PASSWORD*' : '*EMPTY*' }
			])
		}
		: parent
}
export default Password

export const passwordOf = (target: ObjectOrType, property: string) =>
	decoratorOf<boolean>(target, property, PASSWORD, false)
