import { builtOf }                               from '../../builder/built'
import Type                                      from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import { toDisplay }                             from '../rename'

const DISPLAY = Symbol('display')

const Display = (name: string = '') => decorateCallback<string>(
	DISPLAY,
	target => toDisplay((name === '') ? target.name : name)
)

const displayOf = (target: object|Type) => decoratorOfCallback<string>(
	target,
	DISPLAY,
	target => toDisplay((builtOf(target) ? Object.getPrototypeOf(target.constructor) : target.constructor).name)
)

export { Display, displayOf }

export default Display
