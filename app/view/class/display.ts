import { baseType, ObjectOrType }                from '@itrocks/class-type'
import { decorateCallback, decoratorOfCallback } from '@itrocks/decorator/class'
import { toDisplay }                             from '@itrocks/rename'

const DISPLAY = Symbol('display')

export default Display
export function Display(name = '')
{
	return decorateCallback(DISPLAY, target => toDisplay(name.length ? name : target.name))
}

export function displayOf<T extends object>(target: ObjectOrType<T>)
{
	return decoratorOfCallback<T, string>(target, DISPLAY, target => toDisplay(baseType(target).name))
}
