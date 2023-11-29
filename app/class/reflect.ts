import { ReflectProperty } from '../property/reflect'
import { Type, typeOf } from './type'

const properties = (object: object|Type) => propertyNames(object)
	.map(propertyName => new ReflectProperty(typeOf(object), propertyName))

const propertyNames = (object: object|Type) => Object
	.getOwnPropertyNames(new (typeOf(object)))

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

}

export default ReflectClass
export { properties, propertyNames, ReflectClass }
