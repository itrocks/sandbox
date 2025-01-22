import { Display } from '@itrocks/class-view'
import { Action }  from '../../action/action'
import { Request } from '../../action/request'
import User        from '../user'

@Display('user login')
export default class Login extends Action
{

	async html(request: Request<User>)
	{
		return this.htmlTemplateResponse(new request.type, request, __dirname + '/login.html')
	}

}
