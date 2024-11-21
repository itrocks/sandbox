import dao     from '../../../dao/dao'
import Action  from '../../action'
import Need    from '../../need'
import Request from '../../request'

@Need('Store')
export default class Summary extends Action
{

	async json(request: Request)
	{
		const summary = (await dao.search(request.type)).map(object => [object.id, object.toString()])
		return this.jsonResponse(summary)
	}

}
