import { ReflectClass }          from '@itrocks/reflect'
import { dataSource }            from '@itrocks/storage'
import Action                    from '../../../action/action'
import Request                   from '../../../action/request'
import { applyTransformer }      from '../../../property/transform/transformer'
import { HTML, IGNORE }          from '../../../property/transform/transformer'
import { INPUT }                 from '../../../property/transform/transformer'
import { RecursiveStringObject } from '../../../server/request'

export default class Save extends Action
{

	async dataToObject<T extends object>(object: T, data: RecursiveStringObject)
	{
		const properties = new ReflectClass(object).propertyNames
		for (const property in data) {
			if (!properties.includes(property)) continue
			const value = await applyTransformer(data[property], object, property, HTML, INPUT, data)
			if (value === IGNORE) continue
			object[property] = value
		}
	}

	async html(request: Request)
	{
		const object = request.object ?? new request.type
		await this.dataToObject(object, request.request.data)
		await dataSource().save(object)

		return this.htmlTemplateResponse(object, request, __dirname + '/save.html')
	}

	async json(request: Request)
	{
		const object = request.object ?? new request.type
		await this.dataToObject(object, request.request.data)
		await dataSource().save(object)
		return this.jsonResponse(object)
	}

}
