import { v4 }  from 'uuid'
import Action  from '../../action'
import Request from '../../request'

export default class Confirm extends Action
{

	confirmed(request: Request)
	{
		const data             = request.request.data
		const session          = request.request.session
		const confirm          = data.confirm as string
		const confirmedRequest = confirm ? session.confirm[confirm] : undefined
		if (!confirmedRequest) return

		delete session.confirm[confirm]
		confirmedRequest.request.session = session
		return confirmedRequest
	}

	generateConfirmHash(request: Request)
	{
		const hash    = v4()
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
				message: message.replace('\n', '<br>\n\t\t\t'),
				path:    request.request.path,
				target:  JSON.parse(request.request.headers['xhr-info'] ?? '{}').target,
				type:    request.type
			},
			request,
			__dirname + '/confirm.html'
		)
	}

}
