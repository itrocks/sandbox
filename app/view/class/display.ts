import { builtOf } from '../../builder/built'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import { toDisplay } from '../rename'
import Type from '../../class/type'

const Display = (name: string = '') => decorateCallback(
	'display',
	target => toDisplay((name === '') ? target.name : name)
)

const displayOf = (target: object|Type) => decoratorOfCallback<string>(
	target,
	'display',
	target => toDisplay((builtOf(target) ? Object.getPrototypeOf(target.constructor) : target.constructor).name)
)

export default Display
export { Display, displayOf }
