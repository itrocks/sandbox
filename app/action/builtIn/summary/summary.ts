import dataSource from '@itrocks/storage'
import Action     from '../../action'
import Need       from '../../need'
import Request    from '../../request'

@Need('Store')
export default class Summary extends Action
{

	async json(request: Request)
	{
		const summary = (await dataSource().search(request.type)).map(object => [object.id, object + ''])
		return this.jsonResponse(summary)
	}

}
