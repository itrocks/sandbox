import { decorate, decoratorOf } from '../decorator/class'
import Type from '../class/type'

const Built = (value: boolean = true) => decorate('built', value)

const builtOf = (target: object|Type) => decoratorOf<boolean>(target, 'built', false)

export default Built
export { Built, builtOf }
