import { ReflectProperty }                      from '../property/reflect'
import { PropertyTypes, propertyTypesFromFile } from '../property/types'
import { fileOf }                               from './file'
import { Type, typeOf }                         from './type'
import { usesOf }                               from './uses'

export class ReflectClass<T extends { [index: string]: any } = {}>
{
	readonly name:    string
	readonly object?: T
	readonly type:    Type<T>

	constructor(object: T | Type<T>)
	{
		this.object = (typeof object === 'object') ? object : undefined
		this.type   = typeOf(object)
		this.name   = this.type.name
	}

	get parent()
	{
		const value = new ReflectClass(Object.getPrototypeOf(this.type))
		Object.defineProperty(this, 'parent', { value, writable: false })
		return value
	}

	get properties()
	{
		const value = {} as { [name: string]: ReflectProperty }
		for (const name of this.propertyNames) {
			value[name] = new ReflectProperty(this, name)
		}
		Object.defineProperty(this, 'properties', { value, writable: false })
		return value
	}

	get propertyNames()
	{
		const value = Object.getOwnPropertyNames(new (this.type))
		Object.defineProperty(this, 'propertyNames', { value, writable: false })
		return value
	}

	get propertyTypes() : PropertyTypes
	{
		const parent = this.parent
		const value  = parent.name ? parent.propertyTypes : {} as PropertyTypes
		for (const uses of this.uses) {
			Object.assign(value, new ReflectClass(uses).propertyTypes)
		}
		Object.assign(value, propertyTypesFromFile(fileOf(this.type)))
		Object.defineProperty(this, 'propertyTypes', { value, writable: false })
		return value
	}

	get uses()
	{
		const value = usesOf(this.type)
		Object.defineProperty(this, 'uses', { value, writable: false })
		return value
	}

}
export default ReflectClass
