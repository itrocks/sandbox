import { KeyOf, ObjectOrType, typeOf }           from '../../class/type'
import ReflectClass                              from '../../class/reflect'
import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import { requiredOf }                            from '../../property/validate/required'

const REPRESENTATIVE = Symbol('representative')

export const Representative = <T extends object>(...properties: KeyOf<T>[]) => decorateCallback<T>(REPRESENTATIVE, target =>
{
	if (target.prototype.toString === Object.prototype.toString) {
		Object.defineProperty(target.prototype, 'toString', {
			configurable: true,
			enumerable:   false,
			value:        function() { return representativeValueOf<T>(this) },
			writable:     true
		})
	}
	return properties.length
		? properties
		: new ReflectClass(target).propertyNames.filter(name => requiredOf(target, name))
})
export default Representative

export const representativeOf = <T extends object>(target: ObjectOrType<T>): KeyOf<T>[] => {
	const result = decoratorOfCallback<T, KeyOf<T>[]>(target, REPRESENTATIVE)
	if (result) return result
	Representative()(typeOf(target))
	return representativeOf<T>(target)
}

export const representativeValueOf = <T extends object>(target: T) =>
	representativeOf<T>(target)
		.map(property => target[property])
		.filter(value => value?.toString().length)
		.join(' ')
