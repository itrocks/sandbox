import { decorateCallback, decoratorOfCallback } from '../../decorator/class'
import { requiredOf } from '../../property/validate/required'
import Type from '../../class/type'

const defaultValue = (target: object) => {
	return Object.getOwnPropertyNames(target).filter(name => requiredOf(target, name))
}

const Representative = (...properties: string[]) => decorateCallback('representative', target => {
	if (!target.prototype.hasOwnProperty('toString')) {
		target.prototype.toString = function() {
			return representativeValueOf(this)
		}
	}
	return properties.length ? properties : defaultValue(new target)
})

const representativeOf = (target: object|Type) => decoratorOfCallback<string[]>(target, 'representative', defaultValue)

const representativeValueOf = (target: {[property:string]:any}) =>
	representativeOf(target).map(property => target[property]).filter(value => value.length).join(' ')

export default Representative
export { Representative, representativeOf, representativeValueOf }
