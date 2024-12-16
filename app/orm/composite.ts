import { KeyOf, ObjectOrType }   from '../class/type'
import { decorate, decoratorOf } from '../decorator/property'

const COMPOSITE = Symbol('composite')

export const Composite = <T extends object>(value = true) => decorate<T>(COMPOSITE, value)
export default Composite

export const compositeOf = <T extends object>(target: ObjectOrType<T>, property: KeyOf<T>) =>
	decoratorOf(target, property, COMPOSITE, false)
