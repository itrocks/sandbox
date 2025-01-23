import { Action }     from '@itrocks/action'
import { Need }       from '@itrocks/action'
import { Request }    from '@itrocks/action'
import { dataSource } from '@itrocks/storage'

@Need('Store')
export default class Summary extends Action
{

	async json(request: Request)
	{
		const summary = (await dataSource().search(request.type)).map(object => [object.id, object + ''])
		return this.jsonResponse(summary)
	}

}
