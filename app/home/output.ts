import Action      from '../action/action'
import Need        from '../action/need'
import { NOTHING } from '../action/need'
import Route       from '../action/route'
import Request     from '../action/request'

@Need(NOTHING)
@Route('/')
export default class Output extends Action
{

	async html(request: Request)
	{
		return this.htmlTemplateResponse(request.object, request, __dirname + '/output.html')
	}

}
