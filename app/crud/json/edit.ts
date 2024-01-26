import Action   from '../../action/action'
import Need     from '../../action/need'
import Request  from '../../action/request'
import Response from '../../server/response'

@Need('object')
export default class Edit extends Action
{

	run(request: Request): Response
	{
		// the edit API will return data needed by object editors : e.g. links to auto-completion API
		return this.jsonResponse(request.object)
	}

}
