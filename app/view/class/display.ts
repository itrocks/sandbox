import { toDisplay }                             from '@itrocks/rename'
import { ObjectOrType }                          from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'

const DISPLAY = Symbol('display')

export const Display = (name = '') => decorateCallback(
	DISPLAY,
	target => toDisplay(name.length ? name : target.name)
)
export default Display

export const displayOf = <T extends object>(target: ObjectOrType<T>) =>
	decoratorOfCallback<T, string>(target, DISPLAY, target =>
	{
		let name      = target.name
		let prototype = target.prototype
		while (!name.length || (name === 'BuiltClass')) {
			prototype = Object.getPrototypeOf(prototype)
			name      = prototype.constructor.name
		}
		return toDisplay(name)
	})
