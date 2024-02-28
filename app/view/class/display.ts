import Type                                      from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import { toDisplay }                             from '../rename'

const DISPLAY = Symbol('display')

export const Display = (name = '') => decorateCallback<string>(
	DISPLAY,
	target => toDisplay(name.length ? name : target.name)
)
export default Display

export const displayOf = (target: object | Type) => decoratorOfCallback<string>(target, DISPLAY, target =>
{
	let constr = target.constructor
	while (!constr.name.length || (constr.name === 'builtClass')) {
		constr = Object.getPrototypeOf(constr)
	}
	return toDisplay(constr.name)
})
