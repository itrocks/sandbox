import Action   from '../../action/action'
import Need     from '../../action/need'
import Request  from '../../action/request'
import Response from '../../server/response'

@Need('objects')
export default class Delete extends Action
{

	run(request: Request): Response
	{
		return this.jsonResponse(request.objects)
	}

}
