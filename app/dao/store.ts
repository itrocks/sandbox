import { decorateCallback, decoratorOf } from '../decorator/class'
import Type from '../class/type'

const Store = (name: string = '') => decorateCallback(
	'store',
	target => ((name === '') ? target.name.toLowerCase() : name)
)

const storeOf = (target: object|Type) => decoratorOf<false|string>(target, 'store', false)

export default Store
export { Store, storeOf }
