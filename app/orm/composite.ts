import { KeyOf, ObjectOrType }   from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/property'

const COMPOSITE = Symbol('composite')

export default Composite
export function Composite<T extends object>(value = true)
{
	return decorate<T>(COMPOSITE, value)
}

export function compositeOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf(target, property, COMPOSITE, false)
}
