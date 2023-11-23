import Action from '../../action/action'
import need from '../../action/need'
import Request from '../../action/request'

@need('objects')
class Delete extends Action
{

	run(request: Request): Response
	{
		return this.jsonResponse(request.objects)
	}

}

export default Delete
