import { decorate, decoratorOf } from '../../decorator/property'
import Type from '../../class/type'

const email = (value: boolean = true) => decorate('email', value)

const emailOf = (object: object|Type, property: string) => decoratorOf(object, property, 'email', false)

export default email
export { email, emailOf }
