import dataSource from '@itrocks/storage'
import Action     from '../../action/action'
import Save       from '../../action/builtIn/save/save'
import Request    from '../../action/request'
import User       from '../user'

export default class Auth extends Action
{

	async html(request: Request<User>)
	{
		let search = new request.type
		await ((new Save).dataToObject(search, request.request.data))

		const { login, password } = search
		let user: User | undefined
		if (search.login.includes('@')) {
			user = (await dataSource().search(User, { active: true, email: login, password }))[0]
		}
		if (!user) {
			user = (await dataSource().search(User, { active: true, login, password }))[0]
		}
		request.request.session.user = user
		const [templateFile, statusCode] = user
			? ['/auth.html', 200]
			: ['/auth-error.html', 401]
		return this.htmlTemplateResponse(user ?? search, request, __dirname + templateFile, statusCode)
	}

}
