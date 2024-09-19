import Action   from '../../../action/action'
import Need     from '../../../action/need'
import Request  from '../../../action/request'
import dao      from '../../../dao/dao'
import Template from '../../../view/html/template'
import { sep }  from 'path'

@Need('object', 'new')
export default class Edit extends Action
{

	async html(request: Request)
	{
		const template    = new Template({ object: request.object ?? new (request.type), request })
		template.included = (request.request.headers['sec-fetch-dest'] === 'empty')
		return this.htmlResponse(await template.parseFile(
			__dirname + sep + 'edit.html',
			__dirname + sep + '../../../home/output.html'
		))
	}

	async json(request: Request)
	{
		if (request.objects.length === 1) {
			return this.jsonResponse(request.object ?? new (request.type))
		}
		if (request.objects.length > 1) {
			return this.jsonResponse(request.objects)
		}
		const objects = await dao.search(request.type)
		return this.jsonResponse(objects)
	}

}
