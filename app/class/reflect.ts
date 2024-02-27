import { ReflectProperty }        from '../property/reflect'
import { objectOf, Type, typeOf } from './type'

export const properties = (object: object | ReflectClass | Type) =>
	propertyNames(object).map(propertyName => new ReflectProperty(object, propertyName))

export const propertyNames = (object: object | ReflectClass | Type) =>
	Object.getOwnPropertyNames((object instanceof ReflectClass) ? new (object.type) : objectOf(object))

export class ReflectClass
{
	readonly name:    string
	readonly object?: object
	readonly type:    Type

	constructor(object: object | Type)
	{
		this.object = (typeof object === 'object') ? object : undefined
		this.type   = typeOf(object)
		this.name   = this.type.name
	}

	get properties(): ReflectProperty[]
	{
		const value = properties(this)
		Object.defineProperty(this, 'properties', { value, writable: false })
		return value
	}

	get propertyNames(): string[]
	{
		const value = propertyNames(this)
		Object.defineProperty(this, 'propertyNames', { value, writable: false })
		return value
	}

}
export default ReflectClass
