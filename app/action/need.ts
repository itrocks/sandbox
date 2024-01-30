import Type                      from '../class/type'
import { decorate, decoratorOf } from '../decorator/class'

type Needs = ''|'?object'|'object'|'objects'

const NEED = Symbol('need')

const Need = (value: Needs) => decorate(NEED, value)

const needOf = (target: object|Type) => decoratorOf<Needs>(target, NEED, '')

export { Need, needOf, type Needs }

export default Need
