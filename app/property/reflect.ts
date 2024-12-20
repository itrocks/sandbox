import { KeyOf, Type }        from '@itrocks/class-type'
import { CollectionType }     from '@itrocks/property-type'
import { ReflectClass }       from '../class/reflect'
import { applyTransformer }   from './transform/transformer'
import { EDIT, HTML, OUTPUT } from './transform/transformer'
import { HtmlContainer }      from './transform/transformer'

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

	get collectionType(): CollectionType<T>
	{
		const value = this.class.propertyTypes[this.name]
		if (!(value instanceof CollectionType)) {
			throw 'ReflectProperty.collectionType is meant to be used exclusively on collection properties'
		}
		Object.defineProperty(this, 'collectionType', { value })
		return value
	}

	async edit(format: string = HTML): Promise<string>
	{
		const object = this.object ?? this.class.type
		const value  = this.object ? this.object[this.name] : undefined
		return applyTransformer<T>(await value, object, this.name, format, EDIT)
	}

	get object()
	{
		const value = this.class.object
		Object.defineProperty(this, 'object', { value })
		return value
	}

	async output(format: string = HTML, askFor?: HtmlContainer): Promise<string>
	{
		const object = this.object ?? this.class.type
		const value  = this.object ? await this.object[this.name] : undefined
		return applyTransformer<T>(value, object, this.name, format, OUTPUT, askFor)
	}

	async outputMandatoryContainer(format: string = HTML)
	{
		return this.output(format, new HtmlContainer(true))
	}

	async outputOptionalContainer(format: string = HTML)
	{
		return this.output(format, new HtmlContainer(false))
	}

	get type()
	{
		const value = this.class.propertyTypes[this.name]
		Object.defineProperty(this, 'type', { value })
		return value
	}

	get value()
	{
		return this.object ? this.object[this.name] : undefined
	}

}
export default ReflectProperty
