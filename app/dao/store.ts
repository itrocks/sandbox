import Type                              from '../class/type'
import { decorateCallback, decoratorOf } from '../decorator/class'

const Store = (name: string = '') => decorateCallback(
	'store',
	target => ((name === '') ? target.name.toLowerCase() : name)
)

const storeOf = (target: object|Type) => decoratorOf<false|string>(target, 'store', false)

export { Store, storeOf }

export default Store
