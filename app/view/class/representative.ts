import { AnyObject, ObjectOrType, typeOf }       from '../../class/type'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import { requiredOf }                            from '../../property/validate/required'

const REPRESENTATIVE = Symbol('representative')

export const Representative = (...properties: string[]) => decorateCallback(REPRESENTATIVE, function(target)
{
	if (!target.prototype.hasOwnProperty('toString')) {
		target.prototype.toString = function() {
			return representativeValueOf(this)
		}
	}
	return properties.length
		? properties
		: Object.getOwnPropertyNames(new target).filter(name => requiredOf(target, name))
})
export default Representative

export const representativeOf = (target: ObjectOrType): string[] => {
	const result = decoratorOfCallback<string[]>(target, REPRESENTATIVE)
	if (result) return result
	Representative()(typeOf(target))
	return representativeOf(target)
}

export const representativeValueOf = (target: object) =>
	representativeOf(target)
		.map(property => (target as AnyObject)[property])
		.filter(value => value?.toString().length)
		.join(' ')
