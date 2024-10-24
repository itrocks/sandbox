import { ObjectOrType }          from '../../class/type'
import { decorate, decoratorOf } from '../../decorator/property'

const REQUIRED = Symbol('required')

export const Required = (value: boolean = true) => decorate(REQUIRED, value)
export default Required

export const requiredOf = (target: ObjectOrType, property: string) =>
	decoratorOf<boolean>(target, property, REQUIRED, false)
