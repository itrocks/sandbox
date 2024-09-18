import { ReflectClass } from '../class/reflect'
import { Type }         from '../class/type'
import { applyFilter }  from './filter/filter'

export class ReflectProperty<T extends { [index: string]: any } = {}>
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

	edit(format: string = 'html')
	{
		return this.object
			? applyFilter(this.object[this.name], this.class.type, this.name, format, 'edit')
			: undefined
	}

	get object() : { [index: string]: any } | undefined
	{
		const value = this.class.object
		Object.defineProperty(this, 'object', { value, writable: false })
		return value
	}

	output(format: string = 'html')
	{
		return this.object
			? applyFilter(this.object[this.name], this.class.type, this.name, format, 'output')
			: undefined
	}

	get type()
	{
		return this.class.propertyTypes[this.name]
	}

	get value()
	{
		return this.object ? this.object[this.name] : undefined
	}

}
export default ReflectProperty
