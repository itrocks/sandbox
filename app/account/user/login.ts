import { Action }  from '@itrocks/action'
import { Request } from '@itrocks/action'
import { Display } from '@itrocks/class-view'
import User        from '../user'

@Display('user login')
export default class Login extends Action
{

	async html(request: Request<User>)
	{
		return this.htmlTemplateResponse(new request.type, request, __dirname + '/login.html')
	}

}
