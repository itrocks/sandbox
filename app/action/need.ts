import { decorate, decoratorOf } from '../decorator/class'
import Type from '../class/type'

type Needs = ''|'?object'|'object'|'objects'

const need = (value: Needs) => decorate('need', value)

const needOf = (object: object|Type) => decoratorOf<Needs>(object, 'need', '')

export default need
export { need, needOf, Needs }
