import { builtOf }                               from '../../builder/built'
import Type                                      from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import { toDisplay }                             from '../rename'

const Display = (name: string = '') => decorateCallback(
	'display',
	target => toDisplay((name === '') ? target.name : name)
)

const displayOf = (target: object|Type) => decoratorOfCallback<string>(
	target,
	'display',
	target => toDisplay((builtOf(target) ? Object.getPrototypeOf(target.constructor) : target.constructor).name)
)

export { Display, displayOf }

export default Display
