import { KeyOf, ObjectOrType }     from '@itrocks/class-type'
import { decorate, decoratorOf }   from '@itrocks/decorator/property'
import { EDIT, HTML }              from '@itrocks/transformer'
import { INPUT, JSON }             from '@itrocks/transformer'
import { setPropertyTransformers } from '@itrocks/transformer'
import { createHash }              from 'crypto'
import tr                          from '../../locale/translate'
import { displayOf }               from '../../view/property/display'

export const IGNORE = '¤~!~!~!~!~¤'

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
			setPropertyTransformers(target, property, [
				{ format: HTML, direction: EDIT,  transformer: editPassword<T> },
				{ format: HTML, direction: INPUT, transformer: inputPassword },
				{ format: HTML,                   transformer: (value: string) => value.length ? '***********' : '' },
				{ format: JSON,                   transformer: (value: string) => value.length ? '*PASSWORD*' : '*EMPTY*' }
			])
		}
		: parent
}

export function passwordOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf(target, property, PASSWORD, false)
}
