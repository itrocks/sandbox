import { decorate, decoratorOf } from '../decorator/class'
import Type from '../class/type'

type Needs = ''|'?object'|'object'|'objects'

const Need = (value: Needs) => decorate('need', value)

const needOf = (target: object|Type) => decoratorOf<Needs>(target, 'need', '')

export default Need
export { Need, needOf, Needs }
