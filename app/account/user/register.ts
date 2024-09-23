import Action  from '../../action/action'
import Save    from '../../action/builtIn/save/save'
import Request from '../../action/request'
import dao     from '../../dao/dao'
import User    from '../user'

export default class Register extends Action
{

	async html(request: Request)
	{
		let search       = new (request.type) as User
		let templateName = 'register'
		let user: User|undefined

		if (Object.keys(request.request.data).length) {
			new Save().dataToObject(search, request.request.data)

			const { login, password } = search
			user = (login.length && password.length) ? undefined : search
			if (login.includes('@') && !user) {
				user = (await dao.search(User, { email: login, password }))[0]
			}
			if (!user) {
				user = (await dao.search(User, { login, password }))[0]
			}
			if (!user) {
				await dao.save(search)
				templateName = 'registered'
			}
		}

		return this.htmlTemplateResponse(user ?? search, request, __dirname + '/' + templateName + '.html')
	}

}
