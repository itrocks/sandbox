import { ReflectProperty }        from '../property/reflect'
import { objectOf, Type, typeOf } from './type'

export const properties = <T extends object>(object: T | ReflectClass<T> | Type<T>) =>
	propertyNames(object).map(propertyName => new ReflectProperty(object, propertyName))

export const propertyNames = (object: object | ReflectClass | Type) =>
	Object.getOwnPropertyNames((object instanceof ReflectClass) ? new (object.type) : objectOf(object))

export class ReflectClass<T extends object = object>
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

	get properties()
	{
		const value = properties(this)
		Object.defineProperty(this, 'properties', { value, writable: false })
		return value
	}

	get propertyNames()
	{
		const value = propertyNames(this)
		Object.defineProperty(this, 'propertyNames', { value, writable: false })
		return value
	}

}
export default ReflectClass
