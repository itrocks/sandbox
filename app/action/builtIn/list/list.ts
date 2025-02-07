import { Action }     from '@itrocks/action'
import { Request }    from '@itrocks/action-request'
import { Need }       from '@itrocks/action'
import { Route }      from '@itrocks/route'
import { dataSource } from '@itrocks/storage'

@Need('Store', 'new')
@Route('/list')
export class List extends Action
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
