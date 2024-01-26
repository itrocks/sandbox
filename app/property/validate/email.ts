import Type                      from '../../class/type'
import { decorate, decoratorOf } from '../../decorator/property'

const Email = (value: boolean = true) => decorate('email', value)

const emailOf = (target: object|Type, property: string) => decoratorOf(target, property, 'email', false)

export { Email, emailOf }

export default Email
