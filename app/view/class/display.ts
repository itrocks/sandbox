import { baseType, ObjectOrType }                from '@itrocks/class-type'
import { toDisplay }                             from '@itrocks/rename'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'

const DISPLAY = Symbol('display')

export const Display = (name = '') => decorateCallback(
	DISPLAY,
	target => toDisplay(name.length ? name : target.name)
)
export default Display

export const displayOf = <T extends object>(target: ObjectOrType<T>) =>
	decoratorOfCallback<T, string>(target, DISPLAY, target => toDisplay(baseType(target).name))
