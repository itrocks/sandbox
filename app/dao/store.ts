import Type                              from '../class/type'
import { decorateCallback, decoratorOf } from '../decorator/class'

const STORE = Symbol('store')

const Store = (name: false|string = '') => decorateCallback<false|string>(
	STORE,
	target => ((name === '') ? target.name.toLowerCase() : name)
)

const storeOf = (target: object|Type) => decoratorOf<false|string>(target, STORE, false)

export { Store, storeOf }

export default Store
