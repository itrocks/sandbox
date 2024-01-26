import Type                      from '../class/type'
import { decorate, decoratorOf } from '../decorator/class'

type Needs = ''|'?object'|'object'|'objects'

const Need = (value: Needs) => decorate('need', value)

const needOf = (target: object|Type) => decoratorOf<Needs>(target, 'need', '')

export { Need, needOf, type Needs }

export default Need
