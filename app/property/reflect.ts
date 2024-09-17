import { ReflectClass } from '../class/reflect'
import { Type }         from '../class/type'
import tr               from '../locale/translate'
import { passwordOf }   from './filter/password'

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

	get object() : { [index: string]: any } | undefined
	{
		const value = this.class.object
		Object.defineProperty(this, 'object', { value, writable: false })
		return value
	}

	get output()
	{
		if (!this.object) {
			return undefined
		}
		let value = this.object[this.name]
		if (passwordOf(this.object, this.name)) {
			return '***********'
		}
		else if (this.class.propertyTypes[this.name] === 'boolean') {
			return value ? tr('yes') : tr('no')
		}
		return value
	}

	get type() : any
	{
		// TODO string, boolean, etc.
		return undefined
	}

	get value()
	{
		return this.object ? this.object[this.name] : undefined
	}

}
export default ReflectProperty
