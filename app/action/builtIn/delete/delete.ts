import Action  from '../../../action/action'
import Need    from '../../../action/need'
import Request from '../../../action/request'
import dao     from '../../../dao/dao'

@Need('object')
export default class Delete extends Action
{

	async html(request: Request)
	{
		const objects = request.objects
		for (const object of objects) {
			await dao.delete(object)
		}
		return this.htmlTemplateResponse({ objects, type: request.type }, request, __dirname + '/delete.html')
	}

	async json(request: Request)
	{
		const objects = request.objects
		for (const object of objects) {
			await dao.delete(object)
		}
		return this.jsonResponse(objects)
	}

}
