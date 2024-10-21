import Action          from '../../../action/action'
import Request         from '../../../action/request'
import ReflectClass    from '../../../class/reflect'
import { Object }      from '../../../class/type'
import dao             from '../../../dao/dao'
import { applyFilter } from '../../../property/filter/filter'
import { UNCHANGED }   from '../../../property/filter/filter'

export default class Save extends Action
{

	dataToObject(object: Object, data: { [index: string]: string })
	{
		const type = new ReflectClass(object).type
		for (const propertyName of Object.keys(data)) {
			const value = applyFilter(data[propertyName], type, propertyName, 'html', 'input')
			if (value === UNCHANGED) continue
			object[propertyName] = value
		}
	}

	async html(request: Request)
	{
		const object = request.object ?? new (request.type)
		this.dataToObject(object, request.request.data)
		await dao.save(object)

		return this.htmlTemplateResponse(object, request, __dirname + '/save.html')
	}

	async json(request: Request)
	{
		const object = request.object ?? new (request.type)
		this.dataToObject(object, request.request.data)
		await dao.save(object)
		return this.jsonResponse(object)
	}

}
