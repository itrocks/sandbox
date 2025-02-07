import { Action }     from '@itrocks/action'
import { Need }       from '@itrocks/action'
import { Request }    from '@itrocks/action-request'
import { Route }      from '@itrocks/route'
import { dataSource } from '@itrocks/storage'

@Need('object', 'new')
@Route('/output')
export class Output extends Action
{

	async html(request: Request)
	{
		return this.htmlTemplateResponse(await request.getObject(), request, __dirname + '/output.html')
	}

	async json(request: Request)
	{
		const objects = await request.getObjects()
		if (objects.length === 1) {
			return this.jsonResponse(objects[0])
		}
		if (objects.length > 1) {
			return this.jsonResponse(objects)
		}
		return this.jsonResponse(await dataSource().search(request.type))
	}

}
