import Type                      from '../class/type'
import { decorate, decoratorOf } from '../decorator/class'

const BUILT = Symbol('built')

const Built = (value: boolean = true) => decorate<boolean>(BUILT, value)

const builtOf = (target: object|Type) => decoratorOf<boolean>(target, BUILT, false)

export { Built, builtOf }

export default Built
