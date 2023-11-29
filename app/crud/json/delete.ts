import Action from '../../action/action'
import Need from '../../action/need'
import Request from '../../action/request'

@Need('objects')
class Delete extends Action
{

	run(request: Request): Response
	{
		return this.jsonResponse(request.objects)
	}

}

export default Delete
