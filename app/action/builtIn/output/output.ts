import dataSource from '@itrocks/storage'
import Action     from '../../../action/action'
import Need       from '../../../action/need'
import Request    from '../../../action/request'

@Need('object', 'new')
export default class Output extends Action
{

	async html(request: Request)
	{
		return this.htmlTemplateResponse(request.object, request, __dirname + '/output.html')
	}

	async json(request: Request)
	{
		if (request.objects.length === 1) {
			return this.jsonResponse(request.object)
		}
		if (request.objects.length > 1) {
			return this.jsonResponse(request.objects)
		}
		const objects = await dataSource().search(request.type)
		return this.jsonResponse(objects)
	}

}
