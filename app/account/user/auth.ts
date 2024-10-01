import Action  from '../../action/action'
import Save    from '../../action/builtIn/save/save'
import Request from '../../action/request'
import dao     from '../../dao/dao'
import User    from '../user'

export default class Auth extends Action
{

	async html(request: Request)
	{
		let search = new (request.type) as User
		new Save().dataToObject(search, request.request.data)

		let user
		const { login, password } = search
		if (search.login.includes('@')) {
			user = (await dao.search(User, { active: true, email: login, password }))[0]
		}
		if (!user) {
			user = (await dao.search(User, { active: true, login, password }))[0]
		}
		request.request.session.user = user
		const templateFile = user
			? '/auth.html'
			: '/auth-error.html'
		const response = await this.htmlTemplateResponse(user ?? search, request, __dirname + templateFile)
		if (!user) {
			response.statusCode = 401
		}
		return response
	}

}
