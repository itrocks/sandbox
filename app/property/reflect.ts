import { ReflectClass } from '../class/reflect'
import { Type }         from '../class/type'

export class ReflectProperty
{
	#class:        object | ReflectClass | Type
	readonly name: string

	constructor(object: object | ReflectClass | Type, name: string)
	{
		this.#class = object
		this.name   = name
	}

	get class(): ReflectClass
	{
		const value = (this.#class instanceof ReflectClass)
			? this.#class
			: new ReflectClass(this.#class)
		Object.defineProperty(this, 'class', { value, writable: false })
		return value
	}

	get object(): object | undefined
	{
		const value = this.class.object
		Object.defineProperty(this, 'object', { value, writable: false })
		return value
	}

}
export default ReflectProperty
