import Action  from '../../action/action'
import Request from '../../action/request'
import Display from '../../view/class/display'
import User    from '../user'
import Login   from './login'

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
