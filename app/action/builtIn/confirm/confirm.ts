import { createHash } from 'crypto'
import Action         from '../../action'
import Request        from '../../request'

export default class Confirm extends Action
{

	confirmed(request: Request)
	{
		const data             = request.request.data
		const session          = request.request.session
		const confirmedRequest = data.confirm ? session.confirm[data.confirm] : undefined
		if (!confirmedRequest) {
			return
		}
		delete session.confirm[data.confirm]
		confirmedRequest.request.session = session
		return confirmedRequest
	}

	generateConfirmHash(request: Request)
	{
		const hash = createHash('sha512')
			.update(new URLSearchParams(request.request.data).toString(), 'utf8')
			.digest('hex')
		const session = request.request.session
		if (!session.confirm) {
			session.confirm = {}
		}
		session.confirm[hash] = Object.assign(request)
		delete session.confirm[hash].request.session
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
				target:  JSON.parse(request.request.headers['xhr-info'] ?? '{}').target,
				type:    request.type
			},
			request,
			__dirname + '/confirm.html'
		)
	}

}
