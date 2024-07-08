import Action      from '../../../action/action'
import Request     from '../../../action/request'
import dao         from '../../../dao/dao'
import Template    from '../../../view/html/template'
import { routeOf } from '../../route'
import { sep }     from 'path'

export default class List extends Action
{

	async html(request: Request)
	{
		const type        = request.getType()
		const objects     = await dao.search(type)
		const route       = routeOf(type)
		const template    = new Template({ objects, route, type })
		template.included = (request.request.headers['sec-fetch-dest'] === 'empty')
		return this.htmlResponse(await template.parseFile(
			__dirname + sep + 'list.html',
			__dirname + sep + '../../../home/output.html'
		))
	}

	async json(request: Request)
	{
		const objects = await dao.search(request.getType())
		return this.jsonResponse(objects)
	}

}
