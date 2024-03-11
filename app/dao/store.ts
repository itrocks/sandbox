import Type                              from '../class/type'
import { decorateCallback, decoratorOf } from '../decorator/class'

const STORE = Symbol('store')

export const Store = (name: false | string = '') => decorateCallback(
	STORE,
	target => ((name === '') ? target.name.toLowerCase() : name)
)
export default Store

export const storeOf = (target: object | Type) => decoratorOf<false | string>(target, STORE, false)
