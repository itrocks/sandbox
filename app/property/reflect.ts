import { ReflectClass } from '../class/reflect'
import { Type }         from '../class/type'

export class ReflectProperty
{

	#class: object|ReflectClass|Type

	readonly name: string

	constructor(object: object|ReflectClass|Type, name: string)
	{
		this.#class = object
		this.name   = name
	}

	get class() : ReflectClass
	{
		return (this.#class instanceof ReflectClass)
			? this.#class
			: this.#class = new ReflectClass(this.#class)
	}

	get object()
	{
		return this.class.object
	}

}
export default ReflectProperty
