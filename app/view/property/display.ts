import Type                                      from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/property'
import { toDisplay }                             from '../rename'

const DISPLAY = Symbol('display')

const Display = (name: string = '') => decorateCallback<string>(
	DISPLAY,
	(_target, property) => (name === '') ? toDisplay(property) : name
)

const displayOf = (target: object|Type, property: string) => decoratorOfCallback<string>(
	target,
	property,
	DISPLAY,
	(_target, property) => toDisplay(property)
)

export { Display, displayOf }

export default Display
