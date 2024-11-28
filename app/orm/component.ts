import { KeyOf, ObjectOrType }   from '../class/type'
import { decorate, decoratorOf } from '../decorator/property'

const COMPONENT = Symbol('component')

export const Component = <T extends object>(value = true) => decorate<T>(COMPONENT, value)
export default Component

export const componentOf = <T extends object>(target: ObjectOrType<T>, property: KeyOf<T>) =>
	decoratorOf(target, property, COMPONENT, false)
