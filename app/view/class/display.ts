import { builtOf } from '../../builder/built'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import Type from '../../class/type'

const Display = (name: string = '') => decorateCallback(
	'display',
	target => ((name === '') ? target.name.toLowerCase() : name)
)

const displayOf = (target: object|Type) => decoratorOfCallback<string>(
	target,
	'display',
	target => ((builtOf(target) ? Object.getPrototypeOf(target.constructor) : target.constructor).name).toLowerCase()
)

export default Display
export { Display, displayOf }
