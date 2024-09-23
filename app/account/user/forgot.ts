import Action  from '../../action/action'
import Save    from '../../action/builtIn/save/save'
import dao     from '../../dao/dao'
import Request from '../../action/request'
import User    from '../user'

export default class Forgot extends Action
{

	async html(request: Request)
	{
		let search       = new (request.type) as User
		let templateName = 'forgot'
		let user: User|undefined

		if (Object.keys(request.request.data).length) {
			new Save().dataToObject(search, request.request.data)

			const email = search.email
			user = (await dao.search(User, { email }))[0]

			if (user) {
				templateName = 'forgot-sent'
			}
		}

		return this.htmlTemplateResponse(user ?? search, request, __dirname + '/' + templateName + '.html')	}

}
