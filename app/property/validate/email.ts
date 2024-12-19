import { KeyOf, ObjectOrType }   from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/property'

const EMAIL = Symbol('email')

export default Email
export function Email<T extends object>(value = true)
{
	return decorate<T>(EMAIL, value)
}

export function emailOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf(target, property, EMAIL, false)
}
