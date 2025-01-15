import dataSource from '@itrocks/storage'
import Action     from '../../../action/action'
import Request    from '../../../action/request'
import Need       from '../../need'

@Need('Store', 'new')
export default class List extends Action
{

	async html(request: Request)
	{
		const type    = request.type
		const objects = await dataSource().search(type)
		return this.htmlTemplateResponse({ objects, type }, request, __dirname + '/list.html')
	}

	async json(request: Request)
	{
		const objects = await dataSource().search(request.type)
		return this.jsonResponse(objects)
	}

}
