import { ReflectProperty }       from '../property/reflect'
import { PropertyTypes }         from '../property/types'
import { propertyTypesFromFile } from '../property/types'
import { fileOf }                from './file'
import { Object, Type, typeOf }  from './type'
import { usesOf }                from './uses'

export class ReflectClass<T extends Object = {}>
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
		Object.defineProperty(this, 'parent', { value })
		return value
	}

	get properties()
	{
		const value = {} as { [name: string]: ReflectProperty }
		for (const name of this.propertyNames) {
			value[name] = new ReflectProperty(this, name)
		}
		Object.defineProperty(this, 'properties', { value })
		return value
	}

	get propertyNames()
	{
		let   current = new this.type
		const value = Object.getOwnPropertyNames(current)
		while (current) {
			Object.entries(Object.getOwnPropertyDescriptors(current)).forEach(([name, descriptor]) => {
				if (!descriptor.get || (name[0] === '_') || value.includes(name)) {
					return
				}
				value.push(name)
			})
			current = Object.getPrototypeOf(current)
		}
		Object.defineProperty(this, 'propertyNames', { value })
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
