import Action           from '../../../action/action'
import Request          from '../../../action/request'
import ReflectClass     from '../../../class/reflect'
import { StringObject } from '../../../class/type'
import dao              from '../../../dao/dao'
import { applyFilter }  from '../../../property/filter/filter'
import { HTML, IGNORE } from '../../../property/filter/filter'
import { INPUT }        from '../../../property/filter/filter'

export default class Save extends Action
{

	async dataToObject<T extends object>(object: T, data: StringObject)
	{
		const properties = new ReflectClass(object).propertyNames
		for (const property in data) {
			if (!properties.includes(property)) continue
			const value = await applyFilter(data[property], object, property, HTML, INPUT, data)
			if (value === IGNORE) continue
			object[property] = value
		}
	}

	async html(request: Request)
	{
		const object = request.object ?? new (request.type)
		await this.dataToObject(object, request.request.data)
		await dao.save(object)

		return this.htmlTemplateResponse(object, request, __dirname + '/save.html')
	}

	async json(request: Request)
	{
		const object = request.object ?? new (request.type)
		await this.dataToObject(object, request.request.data)
		await dao.save(object)
		return this.jsonResponse(object)
	}

}
