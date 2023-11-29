import Action from '../../action/action'
import Need from '../../action/need'
import Request from '../../action/request'

@Need('object')
class Output extends Action
{

	run(request: Request): Response
	{
		return this.jsonResponse(request.object)
	}

}

export default Output
