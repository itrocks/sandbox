import Action   from '../../action/action'
import Request  from '../../action/request'
import dao      from '../../dao/dao'
import Response from '../../server/response'

export default class List extends Action
{

	async run(request: Request): Promise<Response>
	{
		const objects = await dao.search(request.getType())
		return this.jsonResponse(objects)
	}

}
