import { KeyOf, ObjectOrType }   from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/property'

const REQUIRED = Symbol('required')

export default Required
export function Required<T extends object>(value = true)
{
	return decorate<T>(REQUIRED, value)
}

export function requiredOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf(target, property, REQUIRED, false)
}
