import { ReflectClass } from '../class/reflect'
import { KeyOf, Type }  from '../class/type'
import { applyFilter }  from './filter/filter'
import { EDIT, OUTPUT } from './filter/filter'
import { HTML }         from './filter/filter'

export class ReflectProperty<T extends object>
{
	readonly #class: T | ReflectClass<T> | Type<T>
	readonly name:   KeyOf<T>

	constructor(object: T | ReflectClass<T> | Type<T>, name: KeyOf<T>)
	{
		this.#class = object
		this.name   = name
	}

	get class()
	{
		const value = (this.#class instanceof ReflectClass)
			? this.#class
			: new ReflectClass(this.#class)
		Object.defineProperty(this, 'class', { value })
		return value
	}

	async edit(format: string = HTML)
	{
		if (!this.object) return
		let value = this.object[this.name]
		return await applyFilter(await value, this.object, this.name, format, EDIT)
	}

	get object()
	{
		const value = this.class.object
		Object.defineProperty(this, 'object', { value })
		return value
	}

	async output(format: string = HTML)
	{
		if (!this.object) return
		const value = this.object[this.name]
		return await applyFilter(await value, this.object, this.name, format, OUTPUT)
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
