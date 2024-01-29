import Type                      from '../../class/type'
import { decorate, decoratorOf } from '../../decorator/property'

const REQUIRED = Symbol('required')

const Required = (value: boolean = true) => decorate<boolean>(REQUIRED, value)

const requiredOf = (target: object|Type, property: string) => decoratorOf<boolean>(target, property, REQUIRED, false)

export { Required, requiredOf }

export default Required
