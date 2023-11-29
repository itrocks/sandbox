import Action from '../../action/action'
import dao from '../../dao/dao'
import Need from '../../action/need'
import Request from '../../action/request'

@Need('objects')
class Output extends Action
{

	run(request: Request): Promise<Response>|Response
	{
		if (request.objects.length === 1) {
			return this.jsonResponse(request.object)
		}
		if (request.objects.length > 1) {
			return this.jsonResponse(request.objects)
		}
		return dao.search(request.type).then(objects => this.jsonResponse(objects))
	}

}

export default Output
