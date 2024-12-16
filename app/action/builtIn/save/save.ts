import Action                    from '../../../action/action'
import Request                   from '../../../action/request'
import ReflectClass              from '../../../class/reflect'
import dao                       from '../../../dao/dao'
import { applyTransformer }      from '../../../property/transform/transform'
import { HTML, IGNORE }          from '../../../property/transform/transform'
import { INPUT }                 from '../../../property/transform/transform'
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
		await dao.save(object)

		return this.htmlTemplateResponse(object, request, __dirname + '/save.html')
	}

	async json(request: Request)
	{
		const object = request.object ?? new request.type
		await this.dataToObject(object, request.request.data)
		await dao.save(object)
		return this.jsonResponse(object)
	}

}
