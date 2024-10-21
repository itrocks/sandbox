import { ObjectOrType }          from '../class/type'
import { decorate, decoratorOf } from '../decorator/class'

const NEED = Symbol('need')

export const NOTHING = ''
type NOTHING = ''

export type Needs = NOTHING | 'object' | 'Store'
type Need = { alternative?: string, need: Needs }

export const Need = (need: Needs, alternative?: string) => decorate(NEED, { alternative, need })
export default Need

export const needOf = (target: ObjectOrType) => decoratorOf<Need>(target, NEED, { need: NOTHING })
