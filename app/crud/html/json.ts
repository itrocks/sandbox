import Action   from '../../action/action'
import Need     from '../../action/need'
import Request  from '../../action/request'
import dao      from '../../dao/dao'
import Response from '../../server/response'

@Need('objects')
export default class Output extends Action
{

	async run(request: Request): Promise<Response>
	{
		if (request.objects.length === 1) {
			return this.jsonResponse(request.object)
		}
		if (request.objects.length > 1) {
			return this.jsonResponse(request.objects)
		}
		const objects = await dao.search(request.getType())
		return this.jsonResponse(objects)
	}

}
