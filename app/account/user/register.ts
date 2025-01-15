import dataSource from '@itrocks/storage'
import Action     from '../../action/action'
import Save       from '../../action/builtIn/save/save'
import Request    from '../../action/request'
import User       from '../user'

export default class Register extends Action
{

	async html(request: Request<User>)
	{
		let templateName = 'register'
		let user         = new request.type

		if (Object.keys(request.request.data).length) {
			await ((new Save).dataToObject(user, request.request.data))
			const { email, login, password } = user
			if (email.length && login.length && password.length) {
				const dao   = dataSource()
				const found = (await dao.search(User, {email}))[0]
					|| (await dao.search(User, {login}))[0]
					|| (await dao.search(User, {email: login}))[0]
					|| (await dao.search(User, {login: email}))[0]
				if (found) {
					templateName = 'register-error'
					user         = found
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
