import Type                                      from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import { requiredOf }                            from '../../property/validate/required'

const defaultValue = (target: object) =>
	Object.getOwnPropertyNames(target).filter(name => requiredOf(target, name))

const REPRESENTATIVE = Symbol('representative')

export const Representative = (...properties: string[]) => decorateCallback<string[]>(REPRESENTATIVE, target =>
{
	if (!target.prototype.hasOwnProperty('toString')) {
		target.prototype.toString = function() {
			return representativeValueOf(this)
		}
	}
	return properties.length ? properties : defaultValue(new target)
})
export default Representative

export const representativeOf = (target: object | Type) =>
	decoratorOfCallback<string[]>(target, REPRESENTATIVE, defaultValue)

export const representativeValueOf = (target: { [property: string]: any }) =>
	representativeOf(target).map(property => target[property]).filter(value => value.length).join(' ')
