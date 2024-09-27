import { createHash } from 'crypto'
import Action         from '../../action'
import Request        from '../../request'

export default class Confirm extends Action
{

	confirmed(request: Request)
	{
		const data    = request.request.data
		const session = request.request.session
		if (data.confirm && (request = session[data.confirm])) {
			delete session[data.confirm]
			return request
		}
	}

	generateConfirmHash(request: Request)
	{
		const hash = createHash('sha512')
			.update(new URLSearchParams(request.request.data).toString(), 'utf8')
			.digest('hex')
		request.request.session[hash] = request
		return hash
	}

	html(request: Request, message: string)
	{
		return this.htmlTemplateResponse(
			{
				action:  request.action,
				hash:    this.generateConfirmHash(request),
				message: message.replace("\n", "<br>\n\t\t\t"),
				path:    request.request.path,
				target:  request.request.headers['xhr-info'] ? JSON.parse(request.request.headers['xhr-info']).target : '',
				type:    request.type
			},
			request,
			__dirname + '/confirm.html'
		)
	}

}
