import Action from '../../action/action'
import need from '../../action/need'
import Request from '../../action/request'

@need('object')
class Output extends Action
{

	run(request: Request): Response
	{
		return this.jsonResponse(request.object)
	}

}

export default Output
