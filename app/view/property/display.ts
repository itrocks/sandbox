import { KeyOf, ObjectOrType }                   from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/property'
import { toDisplay }                             from '../rename'

const DISPLAY = Symbol('display')

export const Display = <T extends object>(name = '') => decorateCallback<T>(
	DISPLAY,
	(_target, property) => name.length ? name : toDisplay(property)
)
export default Display

export const displayOf = <T extends object>(target: ObjectOrType<T>, property: KeyOf<T>) => decoratorOfCallback<string, T>(
	target,
	property,
	DISPLAY,
	(_target, property) => toDisplay(property)
)
