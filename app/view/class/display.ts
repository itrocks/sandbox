import { ObjectOrType, typeOf }                  from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import { toDisplay }                             from '../rename'

const DISPLAY = Symbol('display')

export const Display = (name = '') => decorateCallback(
	DISPLAY,
	target => toDisplay(name.length ? name : target.name)
)
export default Display

export const displayOf = <T extends object>(target: ObjectOrType<T>) =>
	decoratorOfCallback<T, string>(target, DISPLAY, target =>
	{
		target = typeOf(target)
		while (!target.name.length || (target.name === 'BuiltClass')) {
			target = target.prototype ?? Object.getPrototypeOf(target)
		}
		return toDisplay(target.name)
	})
