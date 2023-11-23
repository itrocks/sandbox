import { decorate, decoratorOf } from '../../decorator/property'
import Type from '../../class/type'

const required = (value: boolean = true) => decorate('required', value)

const requiredOf = (object: object|Type, property: string) => decoratorOf(object, property, 'required', false)

export default required
export { required, requiredOf }
