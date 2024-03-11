import Type                                      from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/property'
import { toDisplay }                             from '../rename'

const DISPLAY = Symbol('display')

export const Display = (name = '') => decorateCallback(
	DISPLAY,
	(_target, property) => name.length ? name : toDisplay(property)
)
export default Display

export const displayOf = (target: object | Type, property: string) => decoratorOfCallback<string>(
	target,
	property,
	DISPLAY,
	(_target, property) => toDisplay(property)
)
