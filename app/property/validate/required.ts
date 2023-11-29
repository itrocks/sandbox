import { decorate, decoratorOf } from '../../decorator/property'
import Type from '../../class/type'

const Required = (value: boolean = true) => decorate('required', value)

const requiredOf = (target: object|Type, property: string) => decoratorOf(target, property, 'required', false)

export default Required
export { Required, requiredOf }
