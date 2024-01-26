import Action   from '../../action/action'
import Need     from '../../action/need'
import Request  from '../../action/request'
import Response from '../../server/response'

@Need('object')
export default class Output extends Action
{

	run(request: Request): Response
	{
		return this.jsonResponse(request.object)
	}

}
