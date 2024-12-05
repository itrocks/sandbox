import { createHash       }      from 'crypto'
import { KeyOf, ObjectOrType }   from '../../class/type'
import { decorate, decoratorOf } from '../../decorator/property'
import tr                        from '../../locale/translate'
import { displayOf }             from '../../view/property/display'
import { setPropertyFilters }    from './filter'
import { EDIT, HTML, IGNORE }    from './filter'
import { INPUT, JSON }           from './filter'

const PASSWORD = Symbol('password')

const lfTab = '\n\t\t\t\t'

function editPassword<T extends object>(value: string, target: ObjectOrType<T>, property: KeyOf<T>)
{
	const inputValue = value.length ? ` value="${IGNORE}"` : ''
	const label      = `<label for="${property}">${tr(displayOf(target, property))}</label>`
	const input      = `<input id="${property}" name="${property}" type="password"${inputValue}>`
	return label + lfTab + input
}

function inputPassword(value: string)
{
	return ['', IGNORE].includes(value)
		? value
		: createHash('sha512').update(value, 'utf8').digest('hex')
}

export default Password
export function Password<T extends object>(value = true)
{
	const parent = decorate<T>(PASSWORD, value)
	return value
		? (target: T, property: KeyOf<T>) => {
			parent(target, property)
			setPropertyFilters(target, property, [
				{ format: HTML, direction: EDIT,  filter: editPassword<T> },
				{ format: HTML, direction: INPUT, filter: inputPassword },
				{ format: HTML,                   filter: (value: string) => value.length ? '***********' : '' },
				{ format: JSON,                   filter: (value: string) => value.length ? '*PASSWORD*' : '*EMPTY*' }
			])
		}
		: parent
}

export const passwordOf = <T extends object>(target: ObjectOrType<T>, property: KeyOf<T>) =>
	decoratorOf(target, property, PASSWORD, false)
