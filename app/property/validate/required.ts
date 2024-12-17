import { KeyOf, ObjectOrType }   from '@itrocks/class-type'
import { decorate, decoratorOf } from '../../decorator/property'

const REQUIRED = Symbol('required')

export const Required = <T extends object>(value = true) => decorate<T>(REQUIRED, value)
export default Required

export const requiredOf = <T extends object>(target: ObjectOrType<T>, property: KeyOf<T>) =>
	decoratorOf(target, property, REQUIRED, false)
