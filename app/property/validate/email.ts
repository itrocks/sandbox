import { ObjectOrType }          from '../../class/type'
import { decorate, decoratorOf } from '../../decorator/property'

const EMAIL = Symbol('email')

export const Email = (value: boolean = true) => decorate(EMAIL, value)
export default Email

export const emailOf = (target: ObjectOrType, property: string) => decoratorOf<boolean>(target, property, EMAIL, false)
