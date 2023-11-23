import { decorateCallback, decoratorOf } from '../decorator/class'
import Type from '../class/type'

const store = (name: string = '') => decorateCallback(
	'store',
	target => ((name === '') ? target.name.toLowerCase() : name)
)

const storeOf = (object: object|Type) => decoratorOf<false|string>(object, 'store', false)

export default store
export { store, storeOf }
