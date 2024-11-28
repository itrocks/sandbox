import { SortedArray }                   from '@itrocks/sorted-array'
import { ReflectProperty }               from '../property/reflect'
import { PropertyTypes }                 from '../property/type'
import { propertyTypesFromFile }         from '../property/type'
import { fileOf }                        from './file'
import { isObject, KeyOf, Type, typeOf } from './type'
import { usesOf }                        from './uses'
import {decorate, decoratorOf} from '../decorator/class'

const TYPES = Symbol('types')

class SortedPropertyNames<T extends object> extends SortedArray<KeyOf<T>>
{
	constructor(object: T) {
		super(...Object.getOwnPropertyNames(object).sort() as KeyOf<T>[])
	}
}

interface SortedPropertyNames<T extends object> extends SortedArray<KeyOf<T>>
{
	includes(property: string): property is KeyOf<T>
}

export class ReflectClass<T extends object>
{
	readonly name:   string
	readonly object: T | undefined
	readonly type:   Type<T>

	constructor(object: T | Type<T>)
	{
		this.object = isObject(object) ? object : undefined
		this.type   = typeOf(object)
		this.name   = this.type.name
	}

	get parent()
	{
		const value = new ReflectClass(Object.getPrototypeOf(this.type))
		Object.defineProperty(this, 'parent', { value })
		return value
	}

	get properties()
	{
		const properties = {} as Record<KeyOf<T>, ReflectProperty<T>>
		for (const name of this.propertyNames) {
			properties[name] = new ReflectProperty(this, name)
		}
		Object.defineProperty(this, 'properties', { value: properties })
		return properties
	}

	get propertyNames()
	{
		let   object           = new this.type
		const propertyNames    = new SortedPropertyNames(object)
		propertyNames.distinct = true
		while (object) {
			Object.entries(Object.getOwnPropertyDescriptors(object)).forEach(([name, descriptor]) => {
				if (!descriptor.get || (name[0] === '_')) return
				propertyNames.push(name as KeyOf<T>)
			})
			object = Object.getPrototypeOf(object)
		}
		Object.defineProperty(this, 'propertyNames', { value: propertyNames })
		return propertyNames
	}

	get propertyTypes()
	{
		let value: PropertyTypes<T> | undefined = decoratorOf(this.type, TYPES, undefined)
		if (!value) {
			value = {}
			decorate(TYPES, value)(this.type)
			const parent = this.parent
			if (parent.name) {
				Object.assign(value, parent.propertyTypes)
			}
			for (const uses of this.uses) {
				Object.assign(value, new ReflectClass(uses).propertyTypes)
			}
			Object.assign(value, propertyTypesFromFile<T>(fileOf(this.type)))
			return value
		}
		Object.defineProperty(this, 'propertyTypes', { value })
		return value
	}

	get uses()
	{
		const value = usesOf(this.type)
		Object.defineProperty(this, 'uses', { value })
		return value
	}

}
export default ReflectClass
