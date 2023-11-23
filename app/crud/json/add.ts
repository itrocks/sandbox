import Action from '../../action/action'
import Request from '../../action/request'

class Add extends Action
{

	run(request: Request): Response
	{
		// the add API will return data needed by object editors : e.g. links to auto-completion API
		return this.jsonResponse(new (request.type)())
	}

}

export default Add
