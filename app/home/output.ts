import { Action }  from '@itrocks/action'
import { Need }    from '@itrocks/action'
import { NOTHING } from '@itrocks/action'
import { Request } from '@itrocks/action'
import { Route }   from '@itrocks/route'

@Need(NOTHING)
@Route('/')
export default class Output extends Action
{

	async html(request: Request)
	{
		return this.htmlTemplateResponse(request.object, request, __dirname + '/output.html')
	}

}
