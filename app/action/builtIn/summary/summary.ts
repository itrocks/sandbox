import { Action }     from '@itrocks/action'
import { Need }       from '@itrocks/action'
import { Request }    from '@itrocks/action-request'
import { Route }      from '@itrocks/route'
import { dataSource } from '@itrocks/storage'

@Need('Store')
@Route('/summary')
export default class Summary extends Action
{

	async json(request: Request)
	{
		const summary = (await dataSource().search(request.type)).map(object => [object.id, object + ''])
		return this.jsonResponse(summary)
	}

}
