import { Action }     from '@itrocks/action'
import { Need }       from '@itrocks/action'
import { Request }    from '@itrocks/action-request'
import { Route }      from '@itrocks/route'
import { dataSource } from '@itrocks/storage'

@Need('object', 'new')
@Route('/edit')
export class Edit extends Action
{

	async html(request: Request)
	{
		const object = await request.getObject()
		return this.htmlTemplateResponse(object ?? new request.type, request, __dirname + '/edit.html')
	}

	async json(request: Request)
	{
		const objects = await request.getObjects()
		if (objects.length === 1) {
			return this.jsonResponse(objects[0] ?? new request.type)
		}
		if (objects.length > 1) {
			return this.jsonResponse(objects)
		}
		return this.jsonResponse(await dataSource().search(request.type))
	}

}
