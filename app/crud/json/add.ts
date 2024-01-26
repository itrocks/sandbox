import Action   from '../../action/action'
import Request  from '../../action/request'
import Response from '../../server/response'

export default class Add extends Action
{

	run(request: Request): Response
	{
		// the add API will return data needed by object editors : e.g. links to auto-completion API
		return this.jsonResponse(new (request.getType())())
	}

}
