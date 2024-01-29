import Type                                      from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import { requiredOf }                            from '../../property/validate/required'

const defaultValue = (target: object) =>
{
	return Object.getOwnPropertyNames(target).filter(name => requiredOf(target, name))
}

const REPRESENTATIVE = Symbol('representative')

const Representative = (...properties: string[]) => decorateCallback<string[]>(REPRESENTATIVE, target =>
{
	if (!target.prototype.hasOwnProperty('toString')) {
		target.prototype.toString = function() {
			return representativeValueOf(this)
		}
	}
	return properties.length ? properties : defaultValue(new target)
})

const representativeOf = (target: object|Type) => decoratorOfCallback<string[]>(target, REPRESENTATIVE, defaultValue)

const representativeValueOf = (target: { [property: string]: any }) =>
	representativeOf(target).map(property => target[property]).filter(value => value.length).join(' ')

export { Representative, representativeOf, representativeValueOf }

export default Representative
