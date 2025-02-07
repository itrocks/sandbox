import { Action }  from '@itrocks/action'
import { Request } from '@itrocks/action-request'
import { v4 }      from 'uuid'

export class Confirm extends Action
{

	confirmed(request: Request): Request | undefined
	{
		const data             = request.request.data
		const session          = request.request.session
		const confirm          = data.confirm as string
		const confirmedRequest = confirm ? session.confirm[confirm] : undefined
		if (!confirmedRequest) return

		delete session.confirm[confirm]
		confirmedRequest.request.raw     = request.request.raw
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
		const requestClone    = Object.assign(Object.create(Object.getPrototypeOf(request)), request)
		requestClone.request  = Object.assign(Object.create(Object.getPrototypeOf(request.request)), request.request)
		delete requestClone.request.raw
		delete requestClone.request.session
		session.confirm[hash] = requestClone
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
