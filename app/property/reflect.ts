import { ReflectClass } from '../class/reflect'
import { Object, Type } from '../class/type'
import { applyFilter }  from './filter/filter'
import { EDIT, OUTPUT } from './filter/filter'
import { HTML }         from './filter/filter'

export class ReflectProperty<T extends Object = {}>
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

	edit(format: string = HTML)
	{
		return this.object
			? applyFilter(this.object[this.name], this.class.type, this.name, format, EDIT)
			: undefined
	}

	get object() : Object | undefined
	{
		const value = this.class.object
		Object.defineProperty(this, 'object', { value, writable: false })
		return value
	}

	output(format: string = HTML)
	{
		return this.object
			? applyFilter(this.object[this.name], this.class.type, this.name, format, OUTPUT)
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
