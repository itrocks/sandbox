import { ReflectClass } from '../class/reflect'
import { Type }         from '../class/type'

export class ReflectProperty<T extends object>
{
	readonly #class: T | ReflectClass<T> | Type<T>
	readonly name:   string

	constructor(object: T | ReflectClass<T> | Type<T>, name: string)
	{
		this.#class = object
		this.name   = name
	}

	get class()
	{
		const value = (this.#class instanceof ReflectClass)
			? this.#class
			: new ReflectClass(this.#class)
		Object.defineProperty(this, 'class', { value, writable: false })
		return value
	}

	get object()
	{
		const value = this.class.object
		Object.defineProperty(this, 'object', { value, writable: false })
		return value
	}

}
export default ReflectProperty
