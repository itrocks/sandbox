import Action from '../../action/action'
import dao from '../../dao/dao'
import Request from '../../action/request'

class List extends Action
{

	async run(request: Request): Promise<Response>
	{
		return dao.search(request.type).then(objects => this.jsonResponse(objects))
	}

}

export default List
