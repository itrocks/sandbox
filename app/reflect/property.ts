import { HtmlContainer }         from '@itrocks/core-transformers'
import { ReflectProperty as RP } from '@itrocks/reflect'
import { applyTransformer }      from '@itrocks/transformer'
import { EDIT, HTML, OUTPUT }    from '@itrocks/transformer'
import { ReflectClass }          from './class'

export { ReflectProperty }
export default class ReflectProperty<T extends object> extends RP<T>
{

	get class()
	{
		return Object.setPrototypeOf(super.class, ReflectClass.prototype)
	}

	async edit(format: string = HTML): Promise<string>
	{
		const object = this.object ?? this.class.type
		const value  = this.object ? this.object[this.name] : undefined
		return applyTransformer<T>(await value, object, this.name, format, EDIT)
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

}
