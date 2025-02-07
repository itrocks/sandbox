import { Action }                from '@itrocks/action'
import { Request }               from '@itrocks/action-request'
import { ReflectClass }          from '@itrocks/reflect'
import { RecursiveStringObject } from '@itrocks/request-response'
import { Route }                 from '@itrocks/route'
import { dataSource }            from '@itrocks/storage'
import { applyTransformer }      from '@itrocks/transformer'
import { HTML, INPUT }           from '@itrocks/transformer'
import { IGNORE }                from '../../../property/transform/password'

@Route('/save')
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
		const object = (await request.getObject()) ?? new request.type
		await this.dataToObject(object, request.request.data)
		await dataSource().save(object)

		return this.htmlTemplateResponse(object, request, __dirname + '/save.html')
	}

	async json(request: Request)
	{
		const object = (await request.getObject()) ?? new request.type
		await this.dataToObject(object, request.request.data)
		await dataSource().save(object)
		return this.jsonResponse(object)
	}

}
