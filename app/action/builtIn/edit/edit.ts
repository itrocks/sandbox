import Action  from '../../../action/action'
import Need    from '../../../action/need'
import Request from '../../../action/request'
import dao     from '../../../dao/dao'

@Need('object', 'new')
export default class Edit extends Action
{

	async html(request: Request)
	{
		return this.htmlTemplateResponse(request.object ?? new (request.type), request, __dirname + '/edit.html')
	}

	async json(request: Request)
	{
		if (request.objects.length === 1) {
			return this.jsonResponse(request.object ?? new (request.type))
		}
		if (request.objects.length > 1) {
			return this.jsonResponse(request.objects)
		}
		const objects = await dao.search(request.type)
		return this.jsonResponse(objects)
	}

}
