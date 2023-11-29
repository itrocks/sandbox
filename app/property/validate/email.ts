import { decorate, decoratorOf } from '../../decorator/property'
import Type from '../../class/type'

const Email = (value: boolean = true) => decorate('email', value)

const emailOf = (target: object|Type, property: string) => decoratorOf(target, property, 'email', false)

export default Email
export { Email, emailOf }
