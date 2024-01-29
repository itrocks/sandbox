import Type                      from '../../class/type'
import { decorate, decoratorOf } from '../../decorator/property'

const EMAIL = Symbol('email')

const Email = (value: boolean = true) => decorate<boolean>(EMAIL, value)

const emailOf = (target: object|Type, property: string) => decoratorOf<boolean>(target, property, EMAIL, false)

export { Email, emailOf }

export default Email
