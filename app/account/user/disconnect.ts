import { Action }  from '@itrocks/action'
import { Request } from '@itrocks/action-request'
import { Display } from '@itrocks/class-view'
import User        from '../user'
import Login       from './login'

@Display('user login')
export default class Disconnect extends Action
{

	async html(request: Request<User>)
	{
		delete request.request.session.user
		request.request.session.destroy()
		return new Login().html(request)
	}

}
