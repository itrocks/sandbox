import { ReflectClass } from '../class/reflect'
import { Type } from '../class/type'

class ReflectProperty
{

	class: ReflectClass

	name: string

	constructor(object: object|ReflectClass|Type, name: string)
	{
		this.class = (object instanceof ReflectClass) ? object : new ReflectClass(object)
		this.name  = name
	}

	get object() { return this.class.object }

}

export default ReflectProperty
export { ReflectProperty }
