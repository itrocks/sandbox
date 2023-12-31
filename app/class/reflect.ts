import { ReflectProperty } from '../property/reflect'
import { objectOf, Type, typeOf } from './type'

const properties = (object: object|ReflectClass|Type) => propertyNames(object)
	.map(propertyName => new ReflectProperty(object, propertyName))

const propertyNames = (object: object|ReflectClass|Type) => Object
	.getOwnPropertyNames((object instanceof ReflectClass) ? new (object.type) : objectOf(object))

class ReflectClass
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
export { properties, propertyNames, ReflectClass }
