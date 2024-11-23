import Action  from '../../action/action'
import Save    from '../../action/builtIn/save/save'
import Request from '../../action/request'
import dao     from '../../dao/dao'
import User    from '../user'

export default class Register extends Action
{

	async html(request: Request)
	{
		let templateName = 'register'
		let user         = new (request.type) as User

		if (Object.keys(request.request.data).length) {
			await ((new Save).dataToObject(user, request.request.data))
			const { email, login, password } = user
			if (email.length && login.length && password.length) {
				const found = (await dao.search(User, {email}))[0]
					|| (await dao.search(User, {login}))[0]
					|| (await dao.search(User, {email: login}))[0]
					|| (await dao.search(User, {login: email}))[0]
				if (found) {
					user = found
					templateName = 'register-error'
				}
				else {
					await dao.save(user)
					templateName = 'registered'
				}
			}
			else {
				templateName = 'register-error'
			}
		}

		return this.htmlTemplateResponse(user, request, __dirname + '/' + templateName + '.html')
	}

}
