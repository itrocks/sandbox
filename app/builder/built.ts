import Type                      from '../class/type'
import { decorate, decoratorOf } from '../decorator/class'

const Built = (value: boolean = true) => decorate('built', value)

const builtOf = (target: object|Type) => decoratorOf<boolean>(target, 'built', false)

export { Built, builtOf }

export default Built
