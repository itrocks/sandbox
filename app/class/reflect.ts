import { ReflectProperty }        from '../property/reflect'
import { objectOf, Type, typeOf } from './type'

export const properties = (object: object|ReflectClass|Type) => propertyNames(object)
	.map(propertyName => new ReflectProperty(object, propertyName))

export const propertyNames = (object: object|ReflectClass|Type) => Object
	.getOwnPropertyNames((object instanceof ReflectClass) ? new (object.type) : objectOf(object))

export class ReflectClass
{

	name: string

	object: object|null

	type: Type

	constructor(object: object|Type)
	{
		this.object = (typeof object === 'object') ? object : null
		this.type   = typeOf(object)
		this.name   = this.type.name
	}

	get properties()
	{
		return properties(this)
	}

	get propertyNames()
	{
		return propertyNames(this)
	}

}
export default ReflectClass
