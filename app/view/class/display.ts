import { toDisplay }                             from '@itrocks/rename'
import { baseType, ObjectOrType }                from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'

const DISPLAY = Symbol('display')

export const Display = (name = '') => decorateCallback(
	DISPLAY,
	target => toDisplay(name.length ? name : target.name)
)
export default Display

export const displayOf = <T extends object>(target: ObjectOrType<T>) =>
	decoratorOfCallback<T, string>(target, DISPLAY, target => toDisplay(baseType(target).name))
