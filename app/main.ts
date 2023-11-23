import './builder/builder'
import Action from './action/action'
import Action_Request from './action/request'
import Exception from './action/exception';
import { needOf } from './action/need'

function execute(request: Action_Request): Promise<Response>|Response
{
	const accept  = request.headers.get('Accept')
	const accepts = accept ? accept.replace(/ /g, '').split(',') : []
	const format  = (
		[['html', 'text/html'], ['json', 'application/json']].find(([,mime]) => accepts.includes(mime))
		?? ['text', 'text/plain']
	)[0]
	let action: Action
	if (!request.action) {
		throw new Exception('Action is missing')
	}
	try {
		action = new (require('./crud/' + format + '/' + request.action).default)()
	}
	catch {
		throw new Exception('Action ' + request.action + ' not found')
	}
	return request.getObjects().then(objects => {
		if ((needOf(action) === 'object') && !objects.length) {
			return new Exception('Action ' + request.action + ' needs an object').response
		}
		return action.run(request)
	})
}

Bun.serve({

	fetch(http_request: Request): Promise<Response> | Response
	{
		try {
			return execute(new Action_Request(http_request))
		}
		catch (exception) {
			if (exception instanceof Exception) {
				return exception.response
			}
			throw exception
		}
	}

})
