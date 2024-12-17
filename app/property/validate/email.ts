import { KeyOf, ObjectOrType }   from '@itrocks/class-type'
import { decorate, decoratorOf } from '../../decorator/property'

const EMAIL = Symbol('email')

export const Email = <T extends object>(value = true) => decorate<T>(EMAIL, value)
export default Email

export const emailOf = <T extends object>(target: ObjectOrType<T>, property: KeyOf<T>) =>
	decoratorOf(target, property, EMAIL, false)
