import { KeyOf, ObjectOrType }   from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/property'

const COMPONENT = Symbol('component')

export default Component
export function Component<T extends object>(value = true)
{
	return decorate<T>(COMPONENT, value)
}

export function componentOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf(target, property, COMPONENT, false)
}
