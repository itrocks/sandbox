import Type                      from '../../class/type'
import { decorate, decoratorOf } from '../../decorator/property'

const Required = (value: boolean = true) => decorate('required', value)

const requiredOf = (target: object|Type, property: string) => decoratorOf(target, property, 'required', false)

export { Required, requiredOf }

export default Required
