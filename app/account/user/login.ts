import Action  from '../../action/action'
import Request from '../../action/request'
import Display from '../../view/class/display'

@Display('user login')
export default class Login extends Action
{

	async html(request: Request)
	{
		return this.htmlTemplateResponse(new (request.type), request, __dirname + '/login.html')
	}

}
