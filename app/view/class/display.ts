import { ObjectOrType }                          from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import { toDisplay }                             from '../rename'

const DISPLAY = Symbol('display')

export const Display = (name = '') => decorateCallback(
	DISPLAY,
	target => toDisplay(name.length ? name : target.name)
)
export default Display

export const displayOf = (target: ObjectOrType) => decoratorOfCallback<string>(target, DISPLAY, target =>
{
	let constr = target.constructor
	while (!constr.name.length || (constr.name === 'BuiltClass')) {
		constr = Object.getPrototypeOf(constr)
	}
	return toDisplay(constr.name)
})
