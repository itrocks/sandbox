import Type                      from '../class/type'
import { decorate, decoratorOf } from '../decorator/class'

const NEED = Symbol('need')

export type Needs = ''|'?object'|'object'|'objects'

export const Need = (value: Needs) => decorate(NEED, value)
export default Need

export const needOf = (target: object | Type) => decoratorOf<Needs>(target, NEED, '')
